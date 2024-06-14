import { getK8sProvider } from '../k8s';

export function getKnativeProvider(args?: { namespace: string }) {
  const { namespace } = args || {};
  return getK8sProvider({ namespace, cluster: 'knative-cluster' });
}
