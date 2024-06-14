import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { ServiceConfig, ServiceEntryDeployment } from '@tw/types';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { isProduction } from '../constants';
import { toJSONOutput } from '../pulumi-utils';
import { updateServiceConfig } from './loadServiceConfig';
import { getGitRepoName } from '@tw/devops';
import { objectBool } from '../utils/bool';

type DeploymentType = 'k8s' | 'cloud-run';

let deployments: { [t in DeploymentType]?: Record<string, ServiceEntryDeployment> } = {};

export function updateServiceEntry(args: { serviceConfig: ServiceConfig; isK8s; cloudBuild }) {
  const { serviceConfig, isK8s, cloudBuild } = args;
  const k8s = isK8s ?? objectBool(cloudBuild.k8s);
  const { projectId, serviceId, isMultiPerProject } = getConfigs();
  const serviceEntry: ServiceConfig = {
    ...serviceConfig,
    serviceId,
    gitRepo: pulumi.output(getGitRepoName()) as any,
    k8s,
    version: 2.0,
  };

  updateServiceConfig({
    ...serviceEntry,
    ...(isProduction ? { deployments: getDeployments(k8s ? 'k8s' : 'cloud-run') } : null),
  });

  serviceEntry.deployments = getDeployments(k8s ? 'k8s' : 'cloud-run');
  new gcp.storage.BucketObject(
    `service-config`,
    {
      bucket: `devops-${projectId}`,
      content: toJSONOutput(serviceEntry),
      name: `service-config/${getUniqueNameInProject(serviceId, '_')}.json`,
    },
    {
      retainOnDelete: true,
    }
  );
}

export function addServiceEntryDeployment(args: {
  deployment: ServiceEntryDeployment;
  type: DeploymentType;
}) {
  const { deployment, type } = args;
  if (!deployments[type]) deployments[type] = {};
  deployments[type][deployment.name] = deployment;
}

export function getDeployments(type: DeploymentType): Record<string, ServiceEntryDeployment> {
  return {
    ...Object.keys(deployments).reduce((acc, key) => {
      return {
        ...acc,
        ...deployments[key],
      };
    }, {}),
    ...deployments[type],
  };
}
