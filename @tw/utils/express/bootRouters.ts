import { Router, Application } from 'express';
import { serviceId, isK8s, isLocal } from '@tw/constants';

export async function bootRouters(args: {
  defaultRouter: () => Promise<Router>;
  app: Application;
  routers?: Record<string, () => Promise<Router>>;
}) {
  const { routers = {}, defaultRouter, app } = args;
  if (isLocal) {
    app.use(await defaultRouter());
    for (const deploymentName of Object.keys(routers)) {
      app.use(await routers[deploymentName]());
    }
    return;
  }
  let deploymentName = process.env.K_SERVICE || process.env.TW_DEPLOYMENT;
  const isDefault = serviceId === deploymentName;
  if (!isK8s && !isDefault) {
    // service mod
    deploymentName = deploymentName.replace(`${serviceId}-`, '');
  }
  if (isDefault) {
    app.use(await defaultRouter());
    return;
  }
  if (routers[deploymentName]) {
    app.use(await routers[deploymentName]());
  } else {
    throw Error('deployment invalid');
  }
}
