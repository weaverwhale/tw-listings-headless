import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { createChronosServiceAccount } from '../serviceAccount';
import { getConfigs, getUniqueNameInProject } from '../../utils';
import { createTemporalNamespace, deployTemporalWorker } from '../../temporal';
import { K8sResources } from '../../k8s';
import { getServiceImage } from '../../utils/getServiceImage';

export function deployChronosTemporalWorker(args?: {
  k8sResources?: K8sResources;
  workerImageTag?: string;
}) {
  const { k8sResources, workerImageTag } = args;
  const { projectId, serviceId } = getConfigs();

  const { serviceAccount } = createChronosServiceAccount();

  createTemporalNamespace('namespace', { namespace: `${serviceId}-chronos`, projectId, serviceId });

  deployTemporalWorker({
    serviceAccount,
    createK8sDeploymentArgs: {
      podArgs: {
        image: getServiceImage({ serviceId: 'chronos-temporal', imageTag: workerImageTag }),
        ...k8sResources,
      },
      secretVersion: {
        name: pulumi.interpolate`projects/${projectId}/secrets/${getUniqueNameInProject(
          'chronos-temporal'
        )}-env/versions/latest`,
      } as gcp.secretmanager.SecretVersion,
    },
  });
}
