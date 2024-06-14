import { initRuntime } from '@tw/utils/module/runtime';
initRuntime();

import { getExpressApp } from '@tw/utils/module/express';
import { endpointWrapper } from '@tw/utils/module/api';
import { getLogger } from '@tw/utils/module/logger';
import someEndpoint from './endpoints/some-endpoint';

// if you need firebase admin, use the function below from @tw/utils
// import { initializeFirebaseApp } from '@tw/utils/module/initializeFirebaseApp';
// import admin from 'firebase-admin';
// initializeFirebaseApp(admin);

async function startServer() {
  const logger = getLogger();

  const { app, router } = getExpressApp({ autoOpenApi: true });

  // routes
  // Do your magic... 😎
  router.get('/some-endpoint', endpointWrapper(someEndpoint));

  app.use(router);
  app.listen(process.env.PORT);
}

startServer();
