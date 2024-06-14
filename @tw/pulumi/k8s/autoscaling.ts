import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider, getK8sProvider } from './provider';
import { k8sUniqueName } from './utils';

export type CreateHorizontalPodAutoscalerArgs = {
  name: string;
  kind?: string;
  minReplicas?: number;
  maxReplicas?: number;
  apiVersion?: string;
  provider?: K8sProvider;
  averageCPUUtilization?: number;
  averageMemoryUtilization?: number;
  istioEnabled?: boolean;
  scaleDownPolicies?: kubernetes.types.input.autoscaling.v2.HPAScalingPolicy[];
  scaleUpPolicies?: kubernetes.types.input.autoscaling.v2.HPAScalingPolicy[];
};

export function createHorizontalPodAutoScaler(args: CreateHorizontalPodAutoscalerArgs) {
  const {
    name,
    minReplicas = 1,
    maxReplicas,
    kind = 'Deployment',
    apiVersion = 'apps/v1',
    provider = getK8sProvider(),
    averageCPUUtilization = 65,
    averageMemoryUtilization,
    scaleDownPolicies,
    scaleUpPolicies = [
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
  } = args;
  return new kubernetes.autoscaling.v2.HorizontalPodAutoscaler(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name,
      },
      spec: {
        maxReplicas,
        minReplicas,
        scaleTargetRef: {
          apiVersion,
          kind,
          name: name,
        },
        behavior: {
          scaleUp: {
            policies: scaleUpPolicies,
          },
          ...(scaleDownPolicies?.length > 0
            ? {
                scaleDown: {
                  policies: scaleDownPolicies,
                },
              }
            : null),
        },
        metrics: [
          ...(averageMemoryUtilization
            ? [
                {
                  type: 'Resource',
                  resource: {
                    name: 'memory',
                    target: {
                      type: 'Utilization',
                      averageUtilization: averageMemoryUtilization,
                    },
                  },
                },
              ]
            : []),
          ...(averageCPUUtilization
            ? [
                {
                  type: 'Resource',
                  resource: {
                    name: 'cpu',
                    target: {
                      type: 'Utilization',
                      averageUtilization: averageCPUUtilization,
                    },
                  },
                },
              ]
            : []),
        ],
      },
    },
    { provider: provider }
  );
}
