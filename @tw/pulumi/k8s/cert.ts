import * as kubernetes from '@pulumi/kubernetes';
import { getK8sProvider } from './provider';

export function createK8sManagedCertificate(args: {
  name: string;
  domains: string[];
  provider?: kubernetes.Provider;
}) {
  const { name, domains, provider } = args;
  const k8sManagedCertificate = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'networking.gke.io/v1',
      kind: 'ManagedCertificate',
      metadata: {
        name,
      },
      spec: {
        domains,
      },
    },
    { provider: provider || getK8sProvider() }
  );
  return k8sManagedCertificate;
}
