import { HydraApp, FirebaseUser } from '@tw/types';
import express, { type Express, type Router, type Request, type Response } from 'express';
import { isLocal } from '@tw/constants';
import http from 'http';
import { createHttpTerminator } from '@tw/http-terminator';
import { logger } from '../logger';
import { parseExpressApp } from './expressRoutesParser';
import { exportOpenApiFromExpress } from '../api/openApi';
import { ISchemaConverters } from 'class-validator-jsonschema/build/defaultConverters';
import { HttpTerminator } from '@tw/http-terminator/module/types';
import { sleep } from '../sleep';
import { IncomingMessage } from 'http';
import { ping, devopsDebug, addMiddleWares } from '.';
import { MiddleWareConfig } from './types';

export function getExpressApp(
  args: {
    autoOpenApi?: boolean;
    jsonSchemaAdditionalConverters?: ISchemaConverters;
    middlewareConfig?: MiddleWareConfig;
    terminator?: boolean;
    noTimeout?: boolean;
    enableDebugEndpoint?: boolean;
  } = {}
): { app: Express; router: Router; server: http.Server; httpTerminator: HttpTerminator } {
  const {
    autoOpenApi = true,
    jsonSchemaAdditionalConverters,
    middlewareConfig,
    terminator = true,
    noTimeout,
    enableDebugEndpoint,
  } = args;

  const PORT = process.env.PORT || 8080;
  let httpTerminator: HttpTerminator;
  const app = express();
  app.disable('x-powered-by');
  const server = http.createServer(app);
  const router = express.Router();

  server.on('listening', (port) => {
    logger.info('listening');
    const expressPaths = parseExpressApp(app);
    if (isLocal && autoOpenApi)
      exportOpenApiFromExpress(expressPaths, jsonSchemaAdditionalConverters);
    logger.info(
      `server started, routes: ${expressPaths.map((p) => p.path).join(', ')}, port: ${port || PORT}`
    );
    process.env.STARTUP_DONE = 'true';
  });

  addMiddleWares(app, middlewareConfig);

  app.all('/ping', ping);
  if (enableDebugEndpoint) {
    app.all('/_debug', devopsDebug);
  }
  if (terminator) {
    const timeout =
      process.env.gracefulTerminationTimeout !== undefined
        ? Number(process.env.gracefulTerminationTimeout)
        : 3600 * 1000;
    httpTerminator = createHttpTerminator({
      server,
      app,
      gracefulTerminationTimeout: timeout,
    });
    process.on('SIGTERM', async () => {
      if (!server.listening) return;
      process.env.TW_TERMINATING = 'true';
      logger.warn(`SIGTERM signal received: draining HTTP server, timeout: ${timeout}ms`);
      if (!process.env.K_SERVICE && !isLocal) {
        logger.info(`process.env.K_SERVICE is not set, sleeping 30s`);
        // thats what knative does in the queue proxy
        await sleep(30 * 1000);
      }
      const requests = [...httpTerminator.sockets]
        .map((socket) => {
          // @ts-ignore
          const req = socket?._httpMessage?.req as IncomingMessage & {
            traceId: string;
            originalUrl: string;
          };
          // no req means its a keep alive socket
          if (!req) return;
          return {
            url: req.originalUrl,
            traceId: req.traceId,
          };
        })
        .filter(Boolean);
      logger.info({
        message: `drain report`,
        socketsCount: httpTerminator.sockets.size,
        requests,
        requestsCount: requests?.length,
      });
      httpTerminator
        .terminate()
        .then(() => {
          logger.debug('HTTP server closed');
          process.exit(0);
        })
        .catch((err) => {
          logger.debug('HTTP server close error', err);
          process.exit(1);
        });
    });
  } else {
    process.on('SIGTERM', () => {
      logger.info(`SIGTERM signal received: ignoring`);
    });
  }
  if (noTimeout || process.env.TW_NO_TIMEOUT || process.env.K_SERVICE) {
    server.timeout = 0;
    // https://connectreport.com/blog/tuning-http-keep-alive-in-node-js
    server.keepAliveTimeout = 0;
  }
  // https://expressjs.com/en/api.html#app.listen
  app.listen = (port) => {
    if (process.env.TW_NO_SERVER) return;
    app.use((err: any, _req: Request, res: Response, next) => {
      if (err && err.code === 'ECONNABORTED') {
        logger.warn(err);
        res.status(400).end();
      } else next(err);
    });
    return server.listen(port || PORT);
  };
  return { app, router, server, httpTerminator };
}

export type RequestWithUser = Request & { user?: FirebaseUser | HydraApp | undefined };

export { Express, Router, Request, Response, NextFunction, RequestHandler } from 'express';
