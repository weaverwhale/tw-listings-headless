import { ServerResponse } from 'http';
import onFinished from 'on-finished';
import { NextFunction, Request } from './getExpressApp';
import { getLogger } from '../logger';
import { projectId } from '@tw/constants/module/environments';
import { Timer } from '../clock';
import { MiddleWareConfig } from './types';

// https://github.com/googleapis/nodejs-logging/blob/main/src/middleware/express/make-middleware.ts

export interface CloudLoggingHttpRequest {
  requestMethod?: string;
  requestUrl?: string;
  requestSize?: number;
  status?: number;
  responseSize?: number;
  userAgent?: string;
  remoteIp?: string;
  serverIp?: string;
  referer?: string;
  latency?: string;
  cacheLookup?: boolean;
  cacheHit?: boolean;
  cacheValidatedWithOriginServer?: boolean;
  cacheFillBytes?: number;
  protocol?: string;
}

export function removeFalsyProperties(obj) {
  for (const key in obj) {
    if (!obj[key]) {
      delete obj[key];
    }
  }
  return obj;
}

function makeHttpRequestData(
  req: Request,
  res: ServerResponse,
  latencyMilliseconds: number
): CloudLoggingHttpRequest {
  const result: CloudLoggingHttpRequest = {};

  result.requestUrl = req.originalUrl || req.url;
  result.requestMethod = req.method;
  result.userAgent = req.headers['user-agent'];
  result.referer = req.headers['referer'];
  result.status = res.statusCode;
  result.responseSize = Number(res.getHeader('Content-Length')) || 0;
  result.latency = `${(latencyMilliseconds / 1000).toFixed(3)}s`;
  result.remoteIp =
    (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress;
  try {
    result.protocol = new URL(result.requestUrl).protocol;
  } catch {}
  return removeFalsyProperties(result);
}

export function createAccessLoggingMiddleware(
  args: MiddleWareConfig['accessLogging']['args'] = {}
) {
  const { logLevel = 'info', logPing = false, logAtStart } = args;
  const accessLogger = getLogger({ options: { level: logLevel, name: 'access-logs' } });
  return function accessLogging(req: Request, res: ServerResponse, next: NextFunction) {
    if (!logPing && req.url === '/ping') {
      return next();
    }
    const timer = new Timer().start();
    if (logAtStart) {
      const httpRequest = makeHttpRequestData(req, res, 0);
      accessLogger[logLevel]({ httpRequest });
    } else {
      onFinished(res, () => {
        const httpRequest = makeHttpRequestData(req, res, timer.end().ms);
        let level = 'info';
        if (res.statusCode && res.statusCode >= 500) {
          level = 'error';
        } else if (res.statusCode && res.statusCode >= 400) {
          level = 'warn';
        }
        accessLogger[level]({ httpRequest });
      });
    }
    next();
  };
}

const logsLinkBase = `https://console.cloud.google.com/logs/query`;
const logsLinkSuffix = (projectId: string): string =>
  `aroundTime=${new Date().toISOString()};duration=PT2H?project=${projectId}`;

export function traceLogsLink(traceId: string, projectId: string): string {
  return `${logsLinkBase};query=trace%3D%22projects%2F${projectId}%2Ftraces%2F${traceId}%22;${logsLinkSuffix(
    projectId
  )}`;
}

export function logsLinkFilter(filter: Record<string, string>, projectId: string): string {
  let filterString = '';
  for (let [key, value] of Object.entries(filter)) {
    if (!filter[key]) continue;
    if (!['trace', 'labels', 'resource'].includes(key.split('.')[0])) {
      key = `jsonPayload.${key}`;
    }
    filterString += `${key}="${value}"\n`;
  }
  return `${logsLinkBase};query=${encodeURIComponent(filterString)};${logsLinkSuffix(projectId)}`;
}
