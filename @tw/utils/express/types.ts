import { type Router, type RequestHandler, type Request } from 'express';
import { type CompressionOptions } from 'compression';
import * as ExpressInterfaces from 'express-serve-static-core';
import { FirebaseUser } from '@tw/types';
import { LogLevel } from 'bunyan';

export interface Route extends ExpressInterfaces.IRoute {
  stack: Layer[];
  metadata?: any;
  name: string;
}

export interface Layer {
  handle?: Route | Router;
  stack: Layer[];
  route: Route;
  name: string;
  params?: ExpressInterfaces.PathParams;
  path?: string;
  keys: Key[];
  regexp: ExpressRegex;
  method: string;
}

export interface ExpressRegex extends RegExp {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fast_slash: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fast_star: boolean;
}

export interface RouteMetaData {
  path: string;
  pathParams: Parameter[];
  method: string;
  metadata?: any;
  handle?: Layer['handle'];
}

export interface Parameter {
  in: string;
  name: string;
  required: boolean;
  [key: string]: any;
}

export interface Key {
  name: string;
  optional: boolean;
  offset: number;
}

type BaseMiddlewareConfig = {
  enabled?: boolean;
  middleware?: RequestHandler | ((...args: any[]) => RequestHandler);
  isFunction?: boolean;
  wrap?: boolean;
};

export type MiddleWareConfig = {
  enableCors?: BaseMiddlewareConfig & { args?: { allowAll?: boolean } };
  bodyParser?: BaseMiddlewareConfig;
  decodePubsub?: BaseMiddlewareConfig;
  decodeUser?: BaseMiddlewareConfig;
  contextMiddleware?: BaseMiddlewareConfig;
  removeServiceIdPrefix?: BaseMiddlewareConfig;
  downloadFileData?: BaseMiddlewareConfig;
  accessLogging?: BaseMiddlewareConfig & {
    args?: {
      logLevel?: LogLevel;
      logPing?: boolean;
      logAtStart?: boolean;
    };
  };
  enableCompression?: BaseMiddlewareConfig & {
    args?: { options?: CompressionOptions };
  };
  addContextMiddleware?: BaseMiddlewareConfig & {
    args?: { noDDTags?: boolean };
  };
  generalReqValidators?:BaseMiddlewareConfig
};

export interface PubsubPushReqBody<T = any> {
  attributes: Record<string, string>;
  data: T;
  messageId: string;
  message_id: string;
  publishTime: string;
  publish_time: string;
  subscription: string;
}
export interface PubsubRequest<P = any, R = any, B = any, Q = any>
  extends Request<P, R, PubsubPushReqBody, Q> {}

declare module 'express' {
  interface Request {
    user?: FirebaseUser;
  }
}
