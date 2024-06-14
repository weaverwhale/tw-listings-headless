import { downloadFile } from '../gcs';
import { LRUCache } from 'lru-cache';
import { logger } from '../logger';

const cloudRunServicesCache = new LRUCache({
  ttl: 1024 * 60 * 60,
  max: 1000,
  ttlAutopurge: false,
  ignoreFetchAbort: true,
  allowStaleOnFetchAbort: true,
  fetchMethod: async (key: string, oldValue: any) => {
    if (oldValue) {
      logger.debug(`loading crs`);
    }
    try {
      const services = await downloadFile(
        `devops-${process.env.PROJECT_ID}`,
        `cloud-run-services/services.json`,
        {
          forceCloud: true,
        }
      );
      return services;
    } catch (e) {
      logger.error(`failed to download cr services`, e.message);
    }
  },
});

export async function getCloudRunServiceUrl(
  serviceName: string,
  projectId: string = process.env.PROJECT_ID
): Promise<string> {
  const cloudRunServices = await cloudRunServicesCache.fetch('cloudRunServices', {
    allowStale: true,
  });
  const service = cloudRunServices[projectId][serviceName];
  return service?.status?.address?.url;
}
