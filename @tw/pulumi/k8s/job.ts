import * as gcp from '@pulumi/gcp';
import * as kubernetes from '@pulumi/kubernetes';
import { PodTemplateArgs, createPodTemplate } from './pod';
import { K8sProvider } from './provider';
import { toJSONOutput } from '../pulumi-utils';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { getK8sDeploymentEnvs } from './utils';
import { GCPServiceAccount } from '../iam';
import { createK8sServiceAccount } from './sa';
import { createPdb } from './pdbs';
import { getKnativeProvider } from '../knative';
import { deepMerge } from '@tw/helpers';

// metadata.labels is max length 63. job ID is + 37. So name is max 26
const MAX_JOB_NAME_LENGTH = 26;

// https://kubernetes.io/docs/concepts/workloads/controllers/job/

export type K8sJobArgs = {
  name: string;
  serviceAccount: GCPServiceAccount;
  provider?: K8sProvider;
  podArgs?: PodTemplateArgs;
  secretVersion?: gcp.secretmanager.SecretVersion;
  parallelism?: number;
};

export function createK8sJobConfig(args: K8sJobArgs) {
  const { name, serviceAccount, provider = getKnativeProvider(), podArgs, parallelism = 1 } = args;
  if (name.length > MAX_JOB_NAME_LENGTH) {
    throw new Error(`Job name ${name} is too long. Max length is ${MAX_JOB_NAME_LENGTH}`);
  }
  const { projectId, serviceId } = getConfigs();
  const deploymentEnvs = getK8sDeploymentEnvs({
    provider,
    deploymentName: name,
  });

  const k8sServiceAccount = createK8sServiceAccount({
    serviceAccount,
    provider,
  }).k8sServiceAccount;

  const base: PodTemplateArgs = {
    envs: deploymentEnvs,
    allowSpot: false,
    ports: [],
    k8sServiceAccountName: k8sServiceAccount.metadata.name,
    extraVolumes: [{ emptyDir: {}, name: 'tw-state', path: '/tw/state' }],
  };

  const podTemplate = createPodTemplate(deepMerge(base, podArgs));

  const labels = {
    'app.kubernetes.io/name': name,
    'triplewhale.com/deployment': name,
    'triplewhale.com/job': 'true',
    'triplewhale.com/namespace': provider.namespace,
    // @ts-ignore
    ...podTemplate.metadata?.labels,
  };

  const job: kubernetes.batch.v1.JobArgs = {
    metadata: { name, namespace: provider.namespace },
    spec: {
      parallelism,
      ttlSecondsAfterFinished: 604800, // one week
      template: {
        metadata: {
          labels,
        },
        spec: {
          ...podTemplate.spec,
          restartPolicy: 'Never',
        },
      },
    },
  };

  // jobs cannot use maxAvailable, or minAvailable with a percentage. this policy prevents any interruptions
  const INFINITY = 10000;
  createPdb({ name, provider, labels, minAvailable: INFINITY });

  const config = {
    job,
    context: provider.cluster_urn,
  };

  new gcp.storage.BucketObject(
    `${name}-k8s-job`,
    {
      bucket: `devops-${projectId}`,
      content: toJSONOutput(config),
      name: `k8s-jobs/${serviceId}/${getUniqueNameInProject(name)}.json`,
    },
    {
      retainOnDelete: true,
    }
  );
  return config;
}
