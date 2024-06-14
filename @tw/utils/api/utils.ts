import { OpenAPIV3 } from 'openapi-types';
import { ApiConfigArgs, OpenApi, serializeConf, TwOperationObject } from '../express';
import { serviceId } from '@tw/constants';
import type { RateLimitConfig } from '@tw/types/module/devops';

export const baseOpenApiDoc: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: { title: serviceId, version: '1.0.0' },
  paths: {},
  components: { schemas: {} },
};

export function defaultOpenApiOperation(
  path: string,
  method: string,
  openApi: OpenApi
): OpenAPIV3.OperationObject & { 'x-tw' } {
  const { security, overwriteExternalPath, interfaces, operation, deployment } = openApi || {};
  const serviceId = process.env.SERVICE_ID;
  return {
    operationId:
      operation?.operationId ||
      path
        .split('/')
        .filter(Boolean)
        .map((p) => {
          if (p.startsWith(':')) p = p.replace(':', '');
          return p;
        })
        .join('-') +
        '-' +
        method,
    responses: {
      200: {
        description: 'A successful response',
      },
    },
    security:
      security &&
      Object.keys(security)?.map((s) => {
        return { [s]: security[s] };
      }),
    parameters: [],
    tags: operation?.tags?.length ? operation?.tags : [serviceId],
    'x-tw': {
      pathPrefix: overwriteExternalPath?.prefix || serviceId,
      serviceId,
      interfaces,
      deployment,
    },
  };
}

export function getAlternativePath(route: string, apiConfigArgs: ApiConfigArgs) {
  if (apiConfigArgs?.openApi?.overwriteExternalPath) {
    const alternativePath = apiConfigArgs.openApi.overwriteExternalPath;
    let result;
    if (alternativePath.path) result = alternativePath.path;
    return result;
  }
}

const POLICY_DESC =
  'The rate limit policy for this endpoint, ' +
  'given as {quota};w={window} where window is in seconds ' +
  'and quota is the allowed number of calls a user can make per window.';
const RL_DESC = "Information about the user's rate limit usage for this endpoint.";

export function getRateLimitPolicy(conf: RateLimitConfig) {
  return conf.map((def) => `${def.quota};w=${def.window}`).join(', ');
}

function rateLimitHeaders(conf: RateLimitConfig) {
  return {
    'RateLimit-Policy': {
      type: 'string' as const,
      description: POLICY_DESC,
    },
    RateLimit: {
      type: 'string' as const,
      description: RL_DESC,
    },
  };
}

const rateLimitResponse = {
  '429': {
    description: 'Too many requests',
    headers: {
      'Retry-After': {
        type: 'string' as const,
        description: 'The number of seconds until the user can make another request.',
      },
    },
  },
};

export function addRateLimits(op: TwOperationObject, conf: RateLimitConfig) {
  for (let status in op.responses) {
    const res = op.responses[status];
    if (status === '429') {
      res['headers'] = {
        ...res['headers'],
        ...rateLimitResponse['429']['headers'],
      };
    } else {
      res['headers'] = {
        ...res['headers'],
        ...rateLimitHeaders(conf),
      };
    }
  }
  if (!('429' in op.responses)) {
    op.responses = {
      ...op.responses,
      ...rateLimitResponse,
    };
  }
  op['x-tw'].rateLimits = serializeConf(conf);
}
