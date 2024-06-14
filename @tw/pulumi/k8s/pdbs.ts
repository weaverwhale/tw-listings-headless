import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from './provider';
import { k8sUniqueName } from './utils';

export function createPdb(args: {
  name: string;
  provider: K8sProvider;
  labels: Record<string, string>;
  minAvailable?: number | string;
  maxUnavailable?: number | string;
}) {
  const { name, provider, labels, minAvailable, maxUnavailable } = args;
  new kubernetes.policy.v1.PodDisruptionBudget(
    k8sUniqueName(name, provider),
    {
      metadata: { name },
      spec: { maxUnavailable, minAvailable, selector: { matchLabels: labels } },
    },
    { provider }
  );
}
