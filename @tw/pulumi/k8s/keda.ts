import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from './provider';
import { k8sUniqueName } from './utils';
import { PrometheusReleaseName } from '../prometheus';

export type KedaTrigger = {
  type: 'cpu' | 'prometheus';
  metricType?: 'Utilization';
  metadata: {
    serverAddress?: string;
    query?: string;
    threshold?: string;
    value?: string;
    queryParameters?: string;
    activationThreshold?: string;
    ignoreNullValues?: string;
  };
};

export function createKedaPrometheusTrigger(args: {
  release?: PrometheusReleaseName;
  query: string;
  threshold: string;
}): KedaTrigger {
  const { release = 'workloads', query, threshold } = args;
  return {
    type: 'prometheus',
    metadata: {
      serverAddress: `http://${release}-prometheus.monitoring.svc.cluster.local:9090`,
      query,
      threshold,
      queryParameters: '',
      activationThreshold: '1',
      ignoreNullValues: 'true',
    },
  };
}

export type CreateKedaScalerArgs = {
  name: string;
  minReplicas?: number;
  maxReplicas?: number;
  provider: K8sProvider;
  averageCPUUtilization?: number;
  triggers?: KedaTrigger[];
  scaleToZero?: boolean;
};

export function createKedaScaler(args: CreateKedaScalerArgs) {
  const {
    name,
    maxReplicas,
    minReplicas,
    averageCPUUtilization,
    provider,
    triggers = [],
    scaleToZero = false,
  } = args;

  const keda = new kubernetes.apiextensions.CustomResource(
    // https://keda.sh/docs/2.14/concepts/scaling-deployments/#scaledobject-spec
    k8sUniqueName(name, provider),
    {
      apiVersion: 'keda.sh/v1alpha1',
      kind: 'ScaledObject',
      metadata: {
        name,
        annotations: {
          'scaledobject.keda.sh/transfer-hpa-ownership': 'true',
        },
      },
      spec: {
        scaleTargetRef: {
          name,
        },
        pollingInterval: 1,
        cooldownPeriod: 10,
        idleReplicaCount: scaleToZero ? 0 : undefined,
        minReplicaCount: minReplicas,
        maxReplicaCount: maxReplicas,
        triggers: [
          {
            type: 'cpu',
            metricType: 'Utilization',
            metadata: {
              value: String(averageCPUUtilization),
            },
          },
          ...triggers,
        ],
        advanced: {
          horizontalPodAutoscalerConfig: {
            name,
            behavior: {
              scaleUp: {
                policies: [
                  {
                    type: 'Pods',
                    value: 1000,
                    periodSeconds: 1,
                  },
                  {
                    type: 'Percent',
                    value: 1000,
                    periodSeconds: 1,
                  },
                ],
              },
            },
          },
        },
      },
    },
    { provider: provider, deleteBeforeReplace: true }
  );
  return keda;
}
