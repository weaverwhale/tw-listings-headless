import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getProjectSubDomain, iapClientId } from '@tw/constants';
import { ServiceEntryDeployment } from '@tw/types';
import { getCloudRunUrl } from '../cloud-run';
import { isLocal } from '../constants';
import { getIngressUrl } from '../k8s';
import { serviceTarget, CloudRun, K8sIngress, K8sService } from '../types';
import { getConfigs } from './getConfigs';
import { getUniqueNameInProject } from './getUniqueName';
import { objectBool } from './bool';

export function getBaseUrl(service: serviceTarget): pulumi.Output<string> {
  const { serviceId } = getConfigs();
  if (isLocal) {
    return pulumi.interpolate`http://localhost/${serviceId}`;
  } else {
    if (service instanceof CloudRun) {
      return getCloudRunUrl(service);
    } else if (service instanceof K8sIngress) {
      // most likely iap, but might just be a open ingress.
      return getIngressUrl(service);
    } else if (service instanceof K8sService) {
      // internal pass through lb using k8s service.
      return getIngressUrl(service);
    } else if (objectBool(service)) {
      // service entry deployment
      service = service as ServiceEntryDeployment;
      if (service.endpoints.authenticated) {
        return pulumi.output(service.endpoints.authenticated.url);
      }
      return pulumi.output(service.endpoints.open.url);
    }
    if (service === null) {
      throw Error('service is set to null, this is prob a mistake.');
    }
  }
}

export function getFullUrl(
  service: serviceTarget,
  endpoint: pulumi.Input<string>
): pulumi.Output<string> {
  const baseUrl = getBaseUrl(service);
  return pulumi.interpolate`${baseUrl}/${endpoint}`;
}

export function getTriggerUrl(triggerId: pulumi.Input<string>): pulumi.Output<string> {
  const { projectId } = getConfigs();
  return pulumi.interpolate`https://cloudbuild.googleapis.com/v1/projects/${projectId}/triggers/${triggerId}:run`;
}

export function getAudience(service: serviceTarget) {
  const { serviceId } = getConfigs();
  if (isLocal) {
    return pulumi.interpolate`http://localhost/${serviceId}`;
  }
  if (service instanceof gcp.cloudrun.Service) {
    return getCloudRunUrl(service);
  } else if (service instanceof K8sIngress) {
    return iapClientId;
  }
  // auth-proxy
  return (service as ServiceEntryDeployment).endpoints.authenticated.audience;
}

export function createAuthProxyUrl(subDomain: string, canonicalForProject = false) {
  const { projectId } = getConfigs();
  const authProxySubDomain = getProjectSubDomain(projectId);
  const serviceName = canonicalForProject ? subDomain : getUniqueNameInProject(subDomain, '_');
  return `https://${authProxySubDomain}auth-proxy.api.whale3.io/${serviceName}`;
}
