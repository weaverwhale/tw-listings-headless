import * as kubernetes from '@pulumi/kubernetes';
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createLabels } from '../utils';
import { getK8sProvider, K8sProvider } from './provider';
import { TracerOptions } from '@tw/types';
import { createKedaScaler, KedaTrigger } from './keda';
import { createHorizontalPodAutoScaler } from './autoscaling';
import { getK8sDeploymentEnvs, k8sUniqueName } from './utils';
import { createPodTemplate, PodTemplateArgs } from './pod';
import { objectBool } from '../utils/bool';
import { deepMerge } from '@tw/helpers';

export type CreateK8sDeploymentArgs = {
  name: string;
  podArgs: Omit<PodTemplateArgs, 'envs'>;
  labels?: Record<string, string>;
  annotations?: Record<string, pulumi.Input<string>>;
  envs?: Record<string, any>;
  minReplicas?: number;
  maxReplicas?: number;
  secretVersion?: gcp.secretmanager.SecretVersion;
  rollingUpdate?: kubernetes.types.input.apps.v1.RollingUpdateDeployment;
  averageCPUUtilization?: number;
  averageMemoryUtilization?: number;
  scaleUpPolicies?: kubernetes.types.input.autoscaling.v2.HPAScalingPolicy[];
  scaleDownPolicies?: kubernetes.types.input.autoscaling.v2.HPAScalingPolicy[];
  provider?: K8sProvider;
  requestsPerSecond?: number;
  tolerateSpotVM?: boolean;
  datadogConfig?: TracerOptions | 'false';
  kedaTriggers?: KedaTrigger[];
  useKeda?: boolean;
};

// memory
// https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/
export function createK8sDeployment(args: CreateK8sDeploymentArgs) {
  const {
    name,
    podArgs,
    envs,
    minReplicas = 1,
    maxReplicas = 80,
    secretVersion,
    rollingUpdate = {},
    provider = getK8sProvider(),
    datadogConfig,
    kedaTriggers = [],
    labels,
  } = args || {};
  let annotations = args.annotations || {};
  const deploymentEnvs = getK8sDeploymentEnvs({
    envs,
    provider,
    datadogConfig,
    secretVersion,
    deploymentName: name,
  });

  deploymentEnvs.push(...[{ name: 'PORT', value: '8080' }]);
  deploymentEnvs.push({
    name: 'gracefulTerminationTimeout',
    value: String((podArgs.terminationGracePeriodSeconds || 0) * 1000),
  });
  const podTemplate = createPodTemplate(
    deepMerge(
      {
        envs: deploymentEnvs,
        scalesOnMemory: Boolean(args.averageMemoryUtilization),
      },
      podArgs
    )
  );
  // @ts-ignore
  podTemplate.metadata.labels = {
    'triplewhale.com/deployment': name,
    'app.kubernetes.io/name': name,
    // @ts-ignore
    ...podTemplate.metadata.labels,
  };

  if (!objectBool(annotations)) annotations = undefined;

  const k8sDeployment = new kubernetes.apps.v1.Deployment(
    k8sUniqueName(name, provider),
    {
      metadata: {
        labels: {
          ...createLabels(),
          ...labels,
        },
        annotations,
        name: name,
      },
      spec: {
        strategy: {
          rollingUpdate: {
            maxSurge: rollingUpdate.maxSurge || '100%',
            maxUnavailable: rollingUpdate.maxUnavailable || '0%',
          },
          type: 'RollingUpdate',
        },
        selector: {
          matchLabels: {
            'triplewhale.com/deployment': name,
          },
        },
        template: podTemplate,
      },
    },
    { provider }
  );

  if (maxReplicas > minReplicas) {
    if (kedaTriggers.length || args.useKeda) {
      createKedaScaler({
        averageCPUUtilization: args.averageCPUUtilization,
        name,
        provider: provider.dependOn(k8sDeployment),
        triggers: kedaTriggers,
        maxReplicas,
        minReplicas,
      });
    } else {
      createHorizontalPodAutoScaler({
        name,
        kind: 'Deployment',
        maxReplicas,
        minReplicas,
        provider: provider.dependOn(k8sDeployment),
        averageCPUUtilization: args.averageCPUUtilization,
        averageMemoryUtilization: args.averageMemoryUtilization,
        scaleUpPolicies: args.scaleUpPolicies,
        scaleDownPolicies: args.scaleDownPolicies,
      });
    }
  }

  return { k8sDeployment };
}
