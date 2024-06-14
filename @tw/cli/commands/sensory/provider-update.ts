import { callServiceEndpoint } from '@tw/utils/module/callServiceEndpoint';
import { loadServiceConfig } from '../../utils';
import { getServiceInfo } from '../../utils/fs';
import { cliError } from '../../utils/logs';
import { exit } from 'process';
import { selectServices } from '../../enquirer/selectServices';
import { logger } from '@tw/utils/module/logger';
import { cliExit } from '../../utils/exit';

export async function runProviderUpdate(argv) {
  let serviceName = argv.service;
  if (argv.select || !serviceName) {
    serviceName = await selectServices();
  }
  const service = await getServiceInfo(serviceName);
  const serviceConfig = loadServiceConfig(service.absolutePath);
  const providerConfig = serviceConfig.sensory.provider;
  const policiesConfig = serviceConfig.sensory.policies;
  if (!providerConfig) {
    cliExit('No sensory provider found in tw-config.json');
  }
  try {
    const res = await callServiceEndpoint(
      'integration',
      'providers',
      { ...providerConfig, policies: policiesConfig },
      {
        forceCloud: true,
        log: false,
      }
    );
    logger.info('Provider updated', res.data);
  } catch (e) {
    cliError(JSON.stringify(e.response?.data || ''));
  }
}
