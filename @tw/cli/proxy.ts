import express, { Response, Request, NextFunction } from 'express';
import http from 'http';
import https from 'https';
import { createApiGateway } from './api/api-gateway';
import { cliLog, cliSuccess, cliError, cliWarning } from './utils/logs';
import { cliConfig } from './config';
import { sslCertificate, sslKey } from './constants';
import { Services } from './types';
import { cliRouter } from './cliApp';
import { getIdentityToken } from './utils/gcloud';
import { getBaseUrl } from '@tw/utils/module/getBaseUrl';
import { keepAliveAgent, keepAliveHttpsAgent } from '@tw/utils/module/dns';
import { projectIdToHostMap } from '@tw/constants';
import { createProxyServer } from '@tw/http-proxy';
import { testVpn, vpnErrorLog } from './utils/vpn';
import { packageJson } from './constants';
import axios from 'axios';
import stream from 'stream';

const pathErrorLogged = {};

const proxy = createProxyServer({
  changeOrigin: true,
  httpAgent: keepAliveAgent,
  httpsAgent: keepAliveHttpsAgent,
});

proxy.on('error', (err, _req: Request, res: Response | stream.Duplex) => {
  const isCloud = err.address?.startsWith('10.');
  if (err.code === 'ECONNREFUSED' && isCloud) {
    vpnErrorLog();
  }
  cliError(err);
  // check if its a res object
  if (res instanceof http.ServerResponse) {
    if (!res.headersSent) {
      if (isCloud) {
        return res?.status(502)?.send('VPN not connected');
      }
      res.status(502)?.send('service not running');
    }
  }
});

export function createProxy(services: Services) {
  const app = express();

  try {
    const apiGatewayRouter = createApiGateway(services);
    if (apiGatewayRouter) app.use(apiGatewayRouter);
  } catch (e) {
    cliError(`error creating api gateway: ${e}`);
  }

  app.use('/_cli', cliRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.query._cli_project && req.query._cli_project !== cliConfig.projectId) {
      cliWarning(`Got message from wrong project: ${req.query._cli_project}`);
      res.sendStatus(200);
    }
    next();
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const serviceId = req.path.split('/')[1];
    // @ts-ignore
    req.serviceId = serviceId;
    if (serviceId !== 'api') {
      req.url = `/${req.url.split('/').slice(2).join('/')}`;
    }
    next();
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const serviceId = req.serviceId;
    const service = cliConfig.services[serviceId];
    if (!service) {
      return next();
    }
    if (req.query.forceCloud === 'true' || req.originalUrl.startsWith('/api/v2')) {
      return next();
    }
    res.setHeader('x-cli-by', 'local');
    const runtime = service.config.runtime;
    const host = runtime === 'node' ? 'localhost' : '0.0.0.0';
    return proxy.all({
      req,
      res,
      options: {
        target: `http://${host}:${service.servicePort}`,
        changeOrigin: true,
        ws: serviceId === 'api',
      },
    });
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.isPubsub) {
      cliWarning('not forwarding pubsub requests to cloud.');
      return res.status(200).send('ok');
    }
    // logWarning(`${req.originalUrl} -> 🌥️`);
    if (req.originalUrl.startsWith('/api/v2')) {
      return proxy.all({
        req,
        res,
        options: {
          target: `https://${projectIdToHostMap[cliConfig.projectId]}`,
          changeOrigin: true,
          ws: true,
        },
      });
    }
    // @ts-ignore
    const serviceId = req.serviceId;

    const { baseUrl, audience } = await getBaseUrl(serviceId, cliConfig.projectId);

    if (!baseUrl) {
      return next();
    }
    res.setHeader('x-cli-by', 'cloud');
    if (audience) {
      req.headers['authorization'] = `Bearer ${await getIdentityToken()}`;
    } else {
      testVpn(baseUrl).then(({ ok, old }) => {
        if (ok && !old) {
          return cliLog('vpn ok');
        }
        if (!ok) {
          vpnErrorLog();
          res.status(502).send('VPN not connected').destroy();
        }
      });
    }
    req.headers['user-agent'] = `cli-proxy/${packageJson.version}`;
    return proxy.all({
      req,
      res,
      options: {
        target: baseUrl,
      },
    });
  });

  app.use((req, _res, next) => {
    // @ts-ignore
    const serviceId = req.serviceId;
    let message = `Request path: ${req.path}: `;
    if (serviceId) message += `${serviceId} service is not running`;
    else message += 'invalid service';
    if (!pathErrorLogged[req.path]) {
      cliError(message);
      pathErrorLogged[req.path] = true;
    }
    next();
  });

  if (Object.keys(services).length) {
    const port = cliConfig.proxyPort;
    const httpServer = http.createServer(app);
    httpServer.keepAliveTimeout = 0;
    httpServer.headersTimeout = 0;
    httpServer.requestTimeout = 0;
    httpServer.on('error', async (err) => {
      if (err.message.includes('listen EADDRINUSE:')) {
        cliError(`port ${port} is already in use`);
        // attach to other cli process
        try {
          await axios.post(`http://localhost:${port}/_cli/attach`, services);
          cliSuccess('attached to existing cli process');
          cliConfig.proxyPort = 0;
        } catch (e) {
          cliError(`failed to attach to existing cli process: ${e.response.data}`);
        }
      }
    });
    httpServer.listen(port, '::', () => {
      cliLog(`http proxy listening on port ${port}`);
    });
    if (cliConfig.proxySsl) {
      const credentials = { key: sslKey, cert: sslCertificate };
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(443, '::', () => {
        cliLog('https proxy listening');
      });
    }
  }
}
