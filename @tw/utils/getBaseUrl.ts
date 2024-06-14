import { isK8s, localHost } from '@tw/constants';
import { endpointType, ServiceConfig } from '@tw/types';
import { getCloudRunServiceUrl } from './cloudRun/cloudRunServices';
import { getServiceEntry } from './service';

interface GetBaseUrlOptions {
  local?: boolean;
  endpointType?: endpointType;
  deployment?: string;
  stack?: string;
  localPort?: number;
  useUfDeployment?: boolean;
}

export async function getBaseUrl(
  serviceId: string,
  projectId: string,
  opts?: GetBaseUrlOptions
): Promise<{ baseUrl: string; audience?: string; serviceEntry?: ServiceConfig }> {
  const { local, endpointType, deployment, stack, localPort, useUfDeployment } = opts || {};
  if (local) {
    return { baseUrl: `http://${localHost}${localPort ? `:${localPort}` : ''}/${serviceId}` };
  }
  const serviceEntry = await getServiceEntry(serviceId, projectId, stack);
  if (serviceEntry && serviceEntry.version >= 2) {
    let serviceEntryDeployment = serviceEntry.deployments[deployment || serviceId];
    if (useUfDeployment) {
      serviceEntryDeployment = serviceEntry.deployments['uf'] || serviceEntryDeployment;
    }
    if (!serviceEntryDeployment) {
      // fallback to default if deployment is not found
      serviceEntryDeployment = serviceEntry.deployments[serviceId];
    }
    if (endpointType && serviceEntryDeployment.endpoints?.[endpointType]) {
      return {
        baseUrl: serviceEntryDeployment.endpoints[endpointType].url,
        audience: serviceEntryDeployment.endpoints[endpointType].audience,
        serviceEntry,
      };
    }
    if (
      isK8s &&
      serviceEntryDeployment.endpoints?.['cluster-local']?.cluster === process.env.TW_CLUSTER
    ) {
      return {
        baseUrl: serviceEntryDeployment.endpoints['cluster-local'].url,
        serviceEntry,
      };
    }
    if (serviceEntryDeployment.endpoints?.internal) {
      return {
        baseUrl: serviceEntryDeployment.endpoints.internal.url,
        serviceEntry,
      };
    }
    if (serviceEntryDeployment.endpoints?.open) {
      return {
        baseUrl: serviceEntryDeployment.endpoints.open.url,
        serviceEntry,
      };
    }
    // deployed to cloud run only
    return {
      baseUrl: serviceEntryDeployment.endpoints.authenticated.url,
      audience: serviceEntryDeployment.endpoints.authenticated.audience,
      serviceEntry,
    };
  }
  const baseUrl = await getCloudRunServiceUrl(serviceId, projectId);
  return { baseUrl, audience: baseUrl, serviceEntry };
}

export async function getFullUrl(
  serviceId: string,
  projectId: string,
  endpoint: string,
  opts?: GetBaseUrlOptions
) {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }
  const { baseUrl, audience } = await getBaseUrl(serviceId, projectId, opts);
  const url = `${baseUrl}/${endpoint}`;
  return { url, audience, baseUrl };
}
