import * as gcp from '@pulumi/gcp';
import { getConfigs } from './getConfigs';

export async function getAllServices() {
  const { projectId } = getConfigs();

  const services = JSON.parse(
    (
      await gcp.storage.getBucketObjectContent({
        bucket: `devops-${projectId}`,
        name: `cloud-run-services/services.json`,
      })
    ).content
  );
  const servicesNoMods = {};
  Object.keys(services[projectId]).map((serviceId) => {
    if (services[projectId][serviceId]?.metadata?.labels?.['service-id'] === serviceId) {
      servicesNoMods[serviceId] = services[projectId][serviceId];
    }
  });
  return servicesNoMods;
}
