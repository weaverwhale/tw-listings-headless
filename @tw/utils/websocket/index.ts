import { FirebaseUser } from '@tw/types';
import admin from 'firebase-admin';
import http from 'http';
import { serviceId } from '@tw/constants';
import { projectId } from '@tw/constants/module/environments';
import { Server, ServerOptions, Socket } from 'socket.io';
import { addPathToOpenApi } from '../api/openApi';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { type Span } from 'dd-trace';
import {
  RequestGlobalKeys,
  asyncLocalStorage,
  createTraceField,
  createTraceId,
  getStoreKey,
  setStoreKey,
} from '../twContext';
import { traceIdFieldName } from '../constants';
import { logger } from '../logger';
import { Timer } from '../clock';
import {
  CloudLoggingHttpRequest,
  logsLinkFilter,
  removeFalsyProperties,
  traceLogsLink,
} from '../express';
import { addErrorMessageToDatadog, safeActivateSpan, tracer } from '../datadog';
import { getRateLimitPolicy } from '../api/utils';

let auth: admin.auth.Auth;

export function getSocketIOServer<L = DefaultEventsMap, E = DefaultEventsMap>(
  server: http.Server,
  options?: Partial<ServerOptions>,
  opts?: { logging?: boolean; rateLimit?: boolean }
): Server<L, E> {
  const { logging = true, rateLimit } = opts || {};
  const io = new Server<L, E>(server, {
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 60000,
    pingTimeout: 60000,
    ...options,
  });

  io.use(async (socket, next) => {
    auth = auth || admin.auth();
    if (socket.user) {
      return next();
    }
    const token = socket.handshake.auth?.token?.replace('Bearer ', '');
    if (!token) {
      logger.warn('Missing token');
      return next(new Error('Missing token'));
    }
    try {
      const decodedToken = await auth.verifyIdToken(token);
      socket.user = decodedToken as any;
      return next();
    } catch (e: any) {
      return next(e);
    }
  });

  const orgOn = io.on;

  io.on = function (ev, listener) {
    return orgOn.call(io, ev, (socket: Socket, ...args) => {
      const orgSocketOn = socket.on;
      socket.on = function (event, listener) {
        const wrappedListener = async (msg) => {
          const timer = new Timer().start();
          const logParams = getStoreKey('logParams');
          let span: Span;
          if (tracer) {
            span = tracer.startSpan(`ws.event`, {
              // childOf: socket.span || tracer.scope().active(),
              startTime: new Date().getTime(),
              tags: {
                'resource.name': event,
                'tw.logs': logsLinkFilter(
                  {
                    trace: `projects/${projectId}/traces/${socket.traceId}`,
                    wsEventId: logParams.wsEventId,
                  },
                  projectId
                ),
                'tw.traceId': socket.traceId,
                'tw.socketId': socket.id,
                'tw.userId': socket.user.sub,
              },
            });
          }
          return safeActivateSpan(span, async () => {
            try {
              await listener(msg);
            } catch (e) {
              if (span) {
                addErrorMessageToDatadog(e);
              }
              logger.error('wsWrapper', e);
              socket.emit('error', e);
            } finally {
              if (span) {
                span.finish();
              }
              const httpRequest = makeSocketRequestData(socket, timer.end().ms, event as any);
              if (logging) logger.info({ httpRequest });
            }
          });
        };
        return orgSocketOn.call(socket, event, wrappedListener as any);
      };
      return listener(socket, ...args);
    });
  };

  // socket connection tracing
  io.use((socket, next) => {
    const timer = new Timer().start();
    const fullTraceId = socket.handshake.headers['x-cloud-trace-context'] as string;
    const traceId = fullTraceId?.split('/')[0] || createTraceId();
    // @ts-ignore
    socket.emit('traceId', traceId);
    socket.traceId = traceId;
    const socketId = socket.id;
    let logParams: RequestGlobalKeys['logParams'];
    if (tracer) {
      const span = tracer.startSpan('ws.connection', {
        startTime: new Date().getTime(),
        tags: {
          'tw.logs': traceLogsLink(traceId, projectId),
          'tw.traceId': traceId,
          'tw.socketId': socketId,
          'tw.userId': socket.user.sub,
        },
      });
      socket.span = span;
    }
    socket.on('disconnect', (reason) => {
      const httpRequest = makeSocketRequestData(socket, timer.end().ms);
      if (logging) logger.info({ httpRequest, reason, ...logParams });
      if (socket.span) {
        socket.span.finish();
      }
    });
    asyncLocalStorage.run({}, () => {
      logParams = getStoreKey('logParams');
      logParams[traceIdFieldName] = createTraceField(traceId);
      logParams.userId = socket.user.sub;
      logParams.wsSocketId = socketId;
      setStoreKey('context', { traceId, uf: true, socket });
      if (logging) logger.info('a user connected');
      safeActivateSpan(socket.span, () => {
        next();
      });
    });
  });

  // socket event tracing
  io.use((socket, next) => {
    socket.on('error', (err) => {
      addErrorMessageToDatadog(err);
    });
    socket.use(([event, _], next) => {
      asyncLocalStorage.run({}, () => {
        const logParams = getStoreKey('logParams');
        logParams[traceIdFieldName] = createTraceField(socket.traceId);
        logParams.wsEventName = event;
        logParams.wsEventId = createTraceId();
        logParams.wsSocketId = socket.id;
        logParams.userId = socket.user.sub;
        setStoreKey('context', { traceId: socket.traceId, uf: true });
        next();
      });
    });
    next();
  });

  addPathToOpenApi(options.path, 'get', {
    'x-tw': {
      websocket: true,
      pathPrefix: serviceId,
      serviceId: serviceId,
      rateLimits: rateLimit
        ? getRateLimitPolicy([
            { quota: 1, window: 5 },
            { quota: 2, window: 20 },
          ])
        : undefined,
    },
    tags: [serviceId],
    operationId: 'realtime',
    responses: {
      '200': {
        description: 'A successful response',
      },
    },
  });

  return io;
}

function makeSocketRequestData(
  socket: Socket,
  latencyMilliseconds: number,
  event?: string
): CloudLoggingHttpRequest {
  const result: CloudLoggingHttpRequest = {};
  result.requestUrl = socket.handshake.url;
  result.requestMethod = event || 'WS';
  result.userAgent = socket.handshake.headers['user-agent'];
  result.referer = socket.handshake.headers['referer'];
  result.status = 200;
  result.responseSize = 0;
  result.latency = `${(latencyMilliseconds / 1000).toFixed(3)}s`;
  result.remoteIp =
    (socket.handshake.headers['x-forwarded-for'] as string) || socket.handshake.address;
  try {
    result.protocol = new URL(result.requestUrl).protocol;
  } catch {}
  return removeFalsyProperties(result);
}

declare module 'socket.io' {
  interface Socket {
    user?: FirebaseUser;
    traceId?: string;
    span?: Span;
  }
}
