import { Request, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { merge, isErrorResult } from 'openapi-merge';
import { GoogleAuth } from 'google-auth-library';
import { Swagger } from 'atlassian-openapi';
import cors from 'cors';
import * as clock from '@tw/utils/module/clock';
import { createProxyServer, proxyOptions } from '@tw/http-proxy';
import * as fs from 'fs';
import yaml from 'yaml';
import { cliLog, cliError } from '../utils/logs';
import { Services } from '../types';
import { cliConfig } from '../config';
import { keepAliveAgent, keepAliveHttpsAgent } from '@tw/utils/module/dns';
import { parseConf } from '@tw/utils/module/express';
import { cliExit } from '../utils/exit';
import { SuccessfulMergeResult } from 'openapi-merge/dist/data';

const proxy = createProxyServer({
  changeOrigin: true,
  httpAgent: keepAliveAgent,
  httpsAgent: keepAliveHttpsAgent,
  handleErrors: true,
});

let masterRouter = Router();
let reloadWait = false;
const fileWatchers = {};

export function createApiGateway(services: Services) {
  masterRouter.stack = [];
  const router = Router();
  router.use(cors());
  masterRouter.use(router);
  const apispec = generateLocalOpenApiSpec(services);
  if (!apispec) return;
  const swaggerOptions = {
    oauth: {
      clientId: '89529659540-096trej1hjnt3gqogdbj5o573e463i22.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/firebase'],
    },
  };
  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(apispec, {
      swaggerOptions,
    })
  );
  for (const path of Object.keys(apispec.paths)) {
    let expressPath = createExpressPath(path);
    for (const method of Object.keys(apispec.paths[path])) {
      const endpointConfig = apispec.paths[path][method];
      const authMethods = endpointConfig.security?.map((s) => Object.keys(s)).flat();
      const serviceId = path.replace('/api/v2/', '').split('/')[0];
      const pathPrefix = endpointConfig?.['x-tw']?.pathPrefix || serviceId;
      if (pathPrefix !== serviceId) {
        expressPath = expressPath.replace(`/api/v2/${serviceId}`, `/api/v2/${pathPrefix}`);
      }
      const isRunning = services[serviceId];
      if (isRunning) {
        const proxyOptions: proxyOptions = {
          target: `http://localhost:${services[serviceId]?.servicePort}`,
          changeOrigin: true,
        };
        router[method](expressPath, createAuthMiddleWare(endpointConfig, authMethods));
        if (endpointConfig['x-tw']?.rateLimits) {
          createRateLimitMiddlewares(endpointConfig['x-tw'].rateLimits).forEach((mw, i) => {
            router[method](expressPath, mw);
          });
        }
        router[method](expressPath, (req, res) => {
          res.setHeader('x-cli-by', 'api-gateway');
          req.url = req.url.replace(new RegExp(`^/api/v2/${pathPrefix}/`), '');
          proxy.all({ req, res, options: proxyOptions });
        });
      }
    }
  }
  return masterRouter;
}

function generateLocalOpenApiSpec(services: Services) {
  const securityDefinitions: { [k: string]: Swagger.SecurityScheme | any } = {
    firebase: {
      flows: {
        implicit: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          scopes: {
            'https://www.googleapis.com/auth/firebase': 'Firebase scope',
          },
        },
      },
      type: 'oauth2',
      'x-google-issuer': `https://securetoken.google.com/${process.env.PROJECT_ID}`,
      'x-google-jwks_uri':
        'https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      'x-google-audiences': process.env.PROJECT_ID,
    },
    api_key: {
      type: 'apiKey',
      name: 'api_key',
      in: 'query',
    },
    auth0: {
      flows: {
        clientCredentials: {
          tokenUrl: 'https://dev-qy27s0mn.us.auth0.com/oauth/token',
        },
      },
      type: 'oauth2',
    },
  };

  const info = {
    title: 'Api Docs',
    version: '2.0',
  };
  const merges = [];

  for (const serviceId of fs.readdirSync(cliConfig.servicesRoot)) {
    const filePath = `${cliConfig.servicesRoot}/${serviceId}/openapi.yml`;
    if (!fs.existsSync(filePath)) continue;
    if (!fileWatchers[serviceId]) {
      fs.watch(filePath, () => {
        if (!reloadWait) {
          reloadWait = true;
          setTimeout(() => {
            reloadWait = false;
          }, 3000);
          createApiGateway(services);
          cliLog(`Api gateway reload caused by ${serviceId}.`);
        }
      });
    }
    try {
      const rawConfig = yaml.parse(fs.readFileSync(filePath).toString());
      merges.push({
        oas: rawConfig,
        pathModification: {
          prepend: `/api/v2/${serviceId}`,
        },
      });
    } catch (e) {
      cliError(`Error parsing ${filePath}: ${e.message}`);
    }
  }
  if (!merges.length) return null;
  const mergeResult = merge(merges);
  if (isErrorResult(mergeResult)) {
    cliExit(`${mergeResult.message} (${mergeResult.type})`);
  }
  if (!mergeResult.output.components) mergeResult.output.components = {};
  mergeResult.output.components.securitySchemes = securityDefinitions;
  mergeResult.output.info = info;
  return mergeResult.output;
}

function createExpressPath(path: string) {
  const partResults = [];
  for (const part of path.split('/')) {
    let partResult = part;
    if (part.startsWith('{') && part.endsWith('}')) {
      partResult = `:${part.replace('{', '').replace('}', '')}?`;
    }
    partResults.push(partResult);
  }
  const result = partResults.join('/');
  return result;
}

function createAuthMiddleWare(endpointConfig, authMethods) {
  async function authMiddleWare(req: Request, res, next) {
    let allowed =
      !endpointConfig.security?.length || endpointConfig.tags?.includes('x-open-endpoint');
    if (allowed) return next();
    let authorization = req.header('authorization');
    if (authorization === 'undefined') authorization = null;
    if (authorization && authMethods?.includes('firebase')) {
      req.headers['x-apigateway-api-userinfo'] = authorization.split('.')[1];
      req.headers['x-forwarded-authorization'] = authorization;
      allowed = true;
    }
    if (req.query.api_key && authMethods?.includes('api_key')) {
      try {
        const auth = new GoogleAuth({
          scopes: 'https://www.googleapis.com/auth/cloud-platform.read-only',
        });
        const client = await auth.getClient();
        const res: any = await client.request({
          url: `https://apikeys.googleapis.com/v2/keys:lookupKey?keyString=${req.query.api_key}`,
        });
        req.headers['x-apigateway-api-consumer-type'] = 'PROJECT';
        req.headers['x-apigateway-api-consumer-number'] = res.data.parent.split('/')[1];
        allowed = true;
      } catch (e) {
        cliError(`error getting api key ${e}`);
      }
    }
    if (!allowed) {
      return res.status(403).send('not allowed');
    }
    return next();
  }
  return authMiddleWare;
}

const rateLimitStore = new Map<string, { count: number; end: number }>();
function createRateLimitMiddlewares(policy: string): Function[] {
  let config;
  try {
    config = parseConf(policy);
  } catch {
    return [];
  }
  return config.map(
    (conf) =>
      function rateLimitMiddleware(req: Request, res, next) {
        const thisUser =
          // this is a little funky but should work as long as the token is the same
          req.headers['x-apigateway-api-userinfo'] ||
          req.headers['x-apigateway-api-consumer-number'];
        if (!thisUser) return next();
        const { quota, window } = conf;
        const now = Math.ceil(clock.monotonic() / 1000);
        const key = `${thisUser}-${req.path}-${window}`;
        if (!rateLimitStore.has(key)) {
          rateLimitStore.set(key, { count: 0, end: now + window });
          setTimeout(() => {
            rateLimitStore.delete(key);
          }, window * 1000);
        }
        if (++rateLimitStore.get(key).count > quota) {
          cliLog(req.path + ' rate limit exceeded');
          return res
            .status(429)
            .header('Retry-After', rateLimitStore.get(key).end - now + 1)
            .send('Too many requests');
        }
        const msg =
          `limit=${quota}, ` +
          `remaining=${quota - rateLimitStore.get(key).count}, ` +
          `reset=${rateLimitStore.get(key).end - now + 1}`;
        cliLog(req.path + ' rate limit: ' + msg);
        res.header('RateLimit', msg);
        res.header('RateLimit-Policy', policy);
        next();
      }
  );
}
