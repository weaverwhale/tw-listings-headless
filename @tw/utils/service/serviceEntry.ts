import { downloadFile } from '../gcs';
import { logger } from '../logger';
import { ServiceConfig } from '@tw/types';
import { LRUCache } from 'lru-cache';
import { maybeAdd } from '@tw/helpers/module/devops';

const serviceConfigs = new LRUCache({
  ttl: 1024 * 60,
  max: 1000,
  ttlAutopurge: false,
  ignoreFetchAbort: true,
  allowStaleOnFetchAbort: true,
  fetchMethod: async (key: string, oldValue: any) => {
    if (oldValue > 3) return null;
    if (oldValue === null) return oldValue;
    let [serviceId, projectId, stack] = key.split('#');
    if (stack === projectId) stack = null;
    try {
      const service = await downloadFile(
        `devops-${projectId}`,
        `service-config/${serviceId}${maybeAdd(stack, '_', 'prepend')}.json`,
        {
          forceCloud: true,
        }
      );
      return service;
    } catch (e) {
      logger.error(`failed to download ${serviceId} config, tries: ${oldValue | 0}`, e.message);
      return Number(oldValue || 0) + 1;
    }
  },
});

export async function getServiceEntry(
  serviceId: string,
  projectId: string,
  stack?: string
): Promise<ServiceConfig> {
  const key = `${serviceId}#${projectId}#${stack || projectId}`;
  let service: ServiceConfig = await serviceConfigs.fetch(key, { allowStale: true });
  return service;
}
