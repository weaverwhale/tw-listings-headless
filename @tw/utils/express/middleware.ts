import { NextFunction, Request, Response } from 'express';
import express from 'express';
import os from 'os';
import cors from 'cors';
import compression from 'compression';
import { serviceId, projectId } from '@tw/constants';
import { FirebaseClaim } from '@tw/types/module/auth';
import { decodePubSubMessage } from '../decodePubSubMessage';
import {
  asyncLocalStorage,
  createTraceField,
  createTraceId,
  getStoreKey,
  setStoreKey,
} from '../twContext';
import { removeServiceIdFromPath } from './utils';
import { deny } from '../auth';
import { RequestWithUser } from './getExpressApp';
import { getK8sPodInfo } from '../k8s/env';
import { downloadFile } from '../gcs';
import { FileContentFieldNames } from '@tw/types';
import { logger } from '../logger';
import { tracer } from '../datadog';
import { endpointWrapper } from '../api';
import { MiddleWareConfig, PubsubPushReqBody } from './types';
import { traceIdFieldName } from '../constants';
import { createAccessLoggingMiddleware, traceLogsLink } from './logging';

const origins = ['web.app', 'triplewhale.com'];

export const healthChecks: (() => Promise<boolean>)[] = [];

// the order of middlewares is important
export const middlewares: MiddleWareConfig = {
  enableCors: {
    enabled: true,
    middleware: enableCors,
    isFunction: true,
  },
  bodyParser: { enabled: true, middleware: express.json({ limit: '50mb' }) },
  generalReqValidators: { enabled: false, middleware: globalReqValidatorMiddleware },
  decodePubsub: { enabled: true, middleware: decodePubsub },
  decodeUser: { enabled: true, middleware: decodeUser },
  addContextMiddleware: { enabled: true, middleware: addContextMiddleware, isFunction: true },
  removeServiceIdPrefix: { enabled: true, middleware: removeServiceIdPrefix },
  downloadFileData: { enabled: true, middleware: downloadFileData },
  enableCompression: { enabled: true, middleware: enableCompression, isFunction: true },
  accessLogging: { enabled: false, middleware: createAccessLoggingMiddleware, isFunction: true },
};

export function addMiddleWares(app: express.Application, userConfig: MiddleWareConfig) {
  Object.entries(middlewares).forEach(([key, value]) => {
    const enabled = userConfig?.[key]?.enabled ?? value.enabled;
    const args = userConfig?.[key]?.args ?? (value as any).args;
    if (enabled) {
      let middleware = value.middleware;
      if (value.isFunction) {
        middleware = (value.middleware as any)(args);
      }
      // @ts-ignore
      // this will disable auto wrap in /runtime/index.ts
      // and disable auto response in /api/wrapper.ts
      middleware.isMiddleware = true;
      if (value.wrap) {
        middleware = endpointWrapper(middleware);
      }
      app.use(middleware);
    }
  });
}

export function removeServiceIdPrefix(req: Request, _res: Response, next: NextFunction) {
  req.url = removeServiceIdFromPath(process.env.SERVICE_ID, req.url);
  next();
}

export function decodePubsub(req: Request, _res: Response, next: NextFunction) {
  if (isPubsubReq(req) && Object.keys(req.body).length) {
    (req.body as PubsubPushReqBody) = {
      ...req.body?.message,
      ...decodePubSubMessage(req.body),
      subscription: req.body?.subscription,
    };
  }
  next();
}

export async function downloadFileData(req: Request, res: Response, next: NextFunction) {
  const { fileContentFieldName } = req.query;

  if (fileContentFieldName) {
    const { body } = req;
    const fileFieldName = fileContentFieldName as keyof typeof FileContentFieldNames;
    const attributes = body?.attributes || body?.message?.attributes || {};
    if (fileFieldName !== 'none') {
      const { bucketId, objectId, objectGeneration: generation } = attributes;
      if (!bucketId || !objectId) {
        // not a notification message
        logger.warn('no bucketId or objectId in attributes');
        return next();
      }
      try {
        const data = await downloadFile(bucketId, objectId, { generation });
        body[fileFieldName] = data;
      } catch (error) {
        logger.error(`Failed to download file ${bucketId}/${objectId} `, {
          error,
          body,
          query: req.query,
        });
        return res.status(500).send('not ok');
      }
    }
  }
  return next();
}

export async function ping(_req: Request, res: Response) {
  const message = `pong from ${serviceId}`;
  if (process.env.TW_TERMINATING) {
    return res.status(500).send('terminating');
  }
  if (healthChecks.length) {
    const results = await Promise.all(healthChecks.map((fn) => fn()));
    if (results.some((r) => !r)) {
      return res.status(500).send('health failed');
    }
  }
  return res.send(message);
}

export function devopsDebug(_req: Request, res: Response) {
  return res.json({ K8S: getK8sPodInfo() });
}

export function decodeUser(req: Request, _res: Response, next: NextFunction) {
  const b64user = req.headers['x-apigateway-api-userinfo'] as string;
  if (b64user) {
    try {
      req['user'] = JSON.parse(Buffer.from(b64user, 'base64').toString());
    } catch (e) {
      logger.warn(`failed to decode user, ${e}`);
    }
  }
  next();
}

export function addContextMiddleware(args: MiddleWareConfig['addContextMiddleware']['args'] = {}) {
  function contextMiddleware(
    req: Request & { traceId?: string },
    res: Response,
    next: NextFunction
  ) {
    asyncLocalStorage.run({}, () => {
      const logParams = getStoreKey('logParams');
      let shopId =
        req.header('x-tw-shop-id') ||
        (req.query?.shopId as string) ||
        (req.query?.shopDomain as string);
      if (!shopId) {
        if (req.method === 'POST') {
          // pubsub messages have the payload in the body.data field
          const body = req.body?.data || req.body;
          shopId = body?.shopId || body?.shopDomain || body?.shop;
        }
      }
      logParams.shopId = shopId;
      if (req.query.isPubsub === 'true') {
        logParams.pubSubMessageId = req.body?.messageId;
      }
      const fullTraceId = req.header('x-cloud-trace-context');
      const traceId = fullTraceId?.split('/')[0] || createTraceId();
      if (traceId) {
        logParams[traceIdFieldName] = createTraceField(traceId);
      }
      req.traceId = traceId;
      setStoreKey('context', { traceId, uf: req.headers['x-tw-uf'] === 'true', req });
      if (req.user) {
        logParams.userId = req.user.sub;
        // add traceId to requests from the client
      }
      if (!res.headersSent) {
        res.set('x-tw-trace-id', traceId);
      }
      if (tracer && !args.noDDTags) {
        try {
          tracer
            .scope()
            .active()
            .addTags({
              origin: req.headers.origin,
              'tw.logs': traceLogsLink(traceId, projectId),
              'tw.traceId': traceId,
              'tw.shopId': shopId,
              'tw.userId': logParams.userId,
            });
        } catch {}
      }
      next();
    });
  }

  return contextMiddleware;
}

export function enableCors(args: MiddleWareConfig['enableCors']['args'] = {}) {
  const options: cors.CorsOptions = {
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  if (!args.allowAll) {
    options.origin = (origin, callback) => {
      if (
        origins.some((o) => origin?.endsWith(o)) ||
        !origin ||
        origin.split(':')[1]?.endsWith('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    };
  }
  return cors(options);
}

export function enableCompression(args: MiddleWareConfig['enableCompression']['args'] = {}) {
  return compression({ threshold: '512kb', ...args.options });
}

export function addMiddleWaresToNestJs(app, additionalOptions: { nestBodyParser?: boolean } = {}) {
  const { nestBodyParser } = additionalOptions;
  if (nestBodyParser) {
    app.getHttpAdapter().registerParserMiddleware();
  } else {
    app.use(express.json({ limit: '50mb' }));
  }
  app.use(addContextMiddleware());
  app.use(removeServiceIdPrefix);
  app.all('/ping', ping);
  app.use(decodePubsub);
  app.use(decodeUser);
  app.use(enableCors());
}

export function requireClaim(claim: FirebaseClaim) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next();
    if (!user[claim]) return deny(res);
    next();
  };
}

function isPubsubReq(req: Request) {
  return req.query.isPubsub === 'true';
}

export function globalReqValidatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const paramToCheck = ['start', 'end', 'endDate', 'startDate', 'date'];

  const reqData = (req.body ?? req.query ?? req.params ?? {}) as { [key in string]: string };

  Object.entries(reqData).forEach(([key, value]) => {
    if (paramToCheck.includes(key)) {
      const date = new Date(value);
      if (date.toString() === 'Invalid Date') {
        return res.status(400).json({
          message: `Invalid date format for ${key}`,
        });
      }
    }
  });

  next();
}
