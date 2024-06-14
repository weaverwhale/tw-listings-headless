import { initRuntime } from '@tw/utils/module/runtime';
initRuntime();
import { getExpressApp } from '@tw/utils/module/express';
import { endpointWrapper } from '@tw/utils/module/api';
import { createTemporalWorker, getTemporalNamespace } from '@tw/temporal';
import { myFirstActivity } from './activities/myFirstActivity';
import someEndpoint from './endpoints/someEndpoint';

async function startServer() {
  const { app, router } = getExpressApp();

  // routes
  // Do your magic... 😎
  router.get('/some-endpoint', endpointWrapper(someEndpoint));

  app.use(router);
  createTemporalWorker({
    taskQueue: `${process.env.SERVICE_ID}-queue`,
    namespace: getTemporalNamespace(),
    router,
    activities: { myFirstActivity },
    workflowsPath: `${__dirname}/workflows`,
  });

  app.listen();
}

startServer();
