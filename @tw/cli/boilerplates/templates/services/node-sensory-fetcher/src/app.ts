import { initRuntime } from '@tw/utils/module/runtime';
initRuntime();
import { getExpressApp } from '@tw/utils/module/express';
import {
  createSensoryRouter,
  createSensoryTemporalWorker,
  renderProviderConfig,
} from '@tw/temporal';
import { getData } from './getData';
import { accounts, auth, getDefaultBackfillRangeCount } from './fetcher';
import { policyConfigs, providerConfig } from './providerConfig';

async function startServer() {
  const { app } = getExpressApp();
  const { router } = await createSensoryRouter({
    accounts,
    auth,
    getDefaultBackfillRangeCount,
  });
  app.use(router);

  createSensoryTemporalWorker({
    activities: {
      get_data: getData,
    },
    router,
    heartbeatTimeout: '10 seconds',
    startToCloseTimeout: '2 hours',
  });

  app.listen();
}

renderProviderConfig({ provider: providerConfig, policies: policyConfigs });
startServer();
