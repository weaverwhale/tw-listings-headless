import { getConfigs } from './getConfigs';
import * as pulumi from '@pulumi/pulumi';

export function getPubsubTopicId(topicName: pulumi.Input<string>) {
  const { projectId } = getConfigs();
  return pulumi.interpolate`projects/${projectId}/topics/${topicName}`;
}

export function getSecretId(secretName: string) {
  const { projectId } = getConfigs();
  return `projects/${projectId}/secrets/${secretName}/versions/latest`;
}

export function getServiceAccountId(ServiceAccountName: string) {
  const { projectId } = getConfigs();
  return `projects/${projectId}/serviceAccounts/${ServiceAccountName}`;
}

export function getCloudRunServiceId(serviceName: string) {
  const { projectId, location } = getConfigs();
  return `locations/${location}/namespaces/${projectId}/services/${serviceName}`;
}

// passing projectId is temporarily necessary because of the way dataform repos set up in triplewhale-dataland-ops
export function getDataformRepoId(projectId: string, repoName: string) {
  const { location } = getConfigs();
  return `projects/${projectId}/locations/${location}/repositories/${repoName}`;
}

export function getWorkflowId(workflowName: pulumi.Input<string>) {
  const { location, projectId } = getConfigs();
  return pulumi.interpolate`projects/${projectId}/locations/${location}/workflows/${workflowName}`;
}

export function getNetworkId(networkName: string) {
  const { projectId } = getConfigs();
  return `projects/${projectId}/global/networks/${networkName}`;
}

export function getSubnetworkId(subnetworkName: string, location: string) {
  const { projectId } = getConfigs();
  return `projects/${projectId}/regions/${location}/subnetworks/${subnetworkName}`;
}
