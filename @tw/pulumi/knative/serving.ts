import * as kubernetes from '@pulumi/kubernetes';
import * as gcp from '@pulumi/gcp';
import { K8sProvider, PodTemplateArgs, createPodTemplate } from '../k8s';
import { TracerOptions } from '@tw/types';
import { getK8sDeploymentEnvs } from '../k8s/utils';
import { getKnativeProvider } from './provider';
import { pythonWorkers } from '../utils/python';
import { isProduction } from '../constants';
import { TWDomain, getConfigs, createLabels } from '../utils';
import { loadServiceConfig } from '../service';

export type CreateKnativeServingArgs = {
  name: string;
  podArgs: Omit<PodTemplateArgs, 'envs'>;
  envs?: Record<string, any>;
  minReplicas?: number;
  maxReplicas?: number;
  targetBurstCapacity?: number;
  targetUtilizationPercentage?: number;
  timeoutSeconds?: number;
  windowSeconds?: number;
  secretVersion?: gcp.secretmanager.SecretVersion;
  concurrencyLimit?: number;
  provider?: K8sProvider;
  datadogConfig?: TracerOptions | 'false';
  subDomain?: string;
  metricType?: 'rps' | 'concurrency' | 'cpu' | 'memory';
  target?: number;
  rolloutDuration?: number;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export function createKnativeServing(args: CreateKnativeServingArgs, twDomain: TWDomain) {
  const {
    name,
    envs = {},
    podArgs,
    minReplicas = 0,
    maxReplicas = 50,
    secretVersion,
    provider = getKnativeProvider(),
    datadogConfig,
    targetBurstCapacity = 200,
    targetUtilizationPercentage = 70,
    timeoutSeconds = 600,
    concurrencyLimit,
    windowSeconds,
    metricType = 'concurrency',
    target = 80,
    rolloutDuration = 300,
    labels,
  } = args || {};

  const serviceConfig = loadServiceConfig();
  const { config } = getConfigs();

  let concurrency;

  if (concurrencyLimit) {
    concurrency = concurrencyLimit;
  } else if (metricType === 'concurrency') {
    concurrency = target;
  }

  const { workers } = pythonWorkers({
    cpu: podArgs?.CPULimit || podArgs?.CPURequest || '500m',
    concurrency,
    serviceConfig,
    workers: envs.WEB_CONCURRENCY,
  });

  envs.WEB_CONCURRENCY = workers;

  const deploymentEnvs = getK8sDeploymentEnvs({
    envs,
    provider,
    datadogConfig,
    secretVersion,
    deploymentName: name,
  });

  deploymentEnvs.push({ name: 'TW_NO_TIMEOUT', value: 'true' });
  deploymentEnvs.push({
    name: 'gracefulTerminationTimeout',
    value: String((timeoutSeconds || 0) * 1000),
  });

  const podTemplate = createPodTemplate({
    ...podArgs,
    envs: deploymentEnvs,
  });

  // @ts-ignore
  delete podTemplate.spec.containers[0].lifecycle;

  const annotations = {
    'autoscaling.knative.dev/min-scale': String(
      isProduction || config.get('forceMin') ? minReplicas : 0
    ),
    'autoscaling.knative.dev/max-scale': String(maxReplicas),
    // https://knative.dev/docs/serving/autoscaling/concurrency/#target-utilization
    'autoscaling.knative.dev/target-utilization-percentage': String(targetUtilizationPercentage),
    ...args.annotations,
  };

  if (concurrencyLimit === undefined || args.target || args.metricType) {
    annotations['autoscaling.knative.dev/metric'] = metricType;
    annotations['autoscaling.knative.dev/target'] = String(target);
  }

  if (['cpu', 'memory'].includes(metricType)) {
    annotations['autoscaling.knative.dev/class'] = 'hpa.autoscaling.knative.dev';
  }

  const serviceAnnotations = {
    'triplewhale.com/sub': twDomain.getSubDomain(),
    'triplewhale.com/sub-domain': twDomain.getSubDomain(),
  };

  if (targetBurstCapacity !== undefined) {
    annotations['autoscaling.knative.dev/target-burst-capacity'] = String(targetBurstCapacity);
  }

  if (windowSeconds) {
    annotations['autoscaling.knative.dev/window'] = `${windowSeconds}s`;
  }

  if (rolloutDuration && !podArgs.persistentVolumeClaims?.length) {
    serviceAnnotations['serving.knative.dev/rollout-duration'] = process.env.F
      ? '0s'
      : `${rolloutDuration}s`;
  }

  const knativeServing = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'serving.knative.dev/v1',
      kind: 'Service',
      metadata: {
        name,
        // knative deletes annotations it doesn't know about from the service
        annotations: serviceAnnotations,
        labels: {
          'triplewhale.com/private': 'cluster-local',
          'triplewhale.com/visibility': 'cluster-local',
          ...labels,
        },
      },
      spec: {
        template: {
          metadata: {
            annotations,
            labels: {
              ...createLabels(),
              'triplewhale.com/deployment': name,
              'app.kubernetes.io/name': name,
              // @ts-ignore
              ...podTemplate.metadata.labels,
            },
          },
          spec: {
            ...podTemplate.spec,
            ...(concurrencyLimit ? { containerConcurrency: concurrencyLimit } : null),
            timeoutSeconds,
            responseStartTimeoutSeconds: timeoutSeconds,
            idleTimeoutSeconds: timeoutSeconds,
          },
        },
        traffic: [
          {
            percent: 100,
            latestRevision: true,
          },
        ],
      },
    },
    { provider }
  );
  return { knativeServing };
}
