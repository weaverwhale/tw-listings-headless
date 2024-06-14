import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from './provider';
import { _k8sNamespaces } from './namespace';

export function createHelmRelease(args: {
  name: string;
  provider: K8sProvider;
  releaseArgs: kubernetes.helm.v3.ReleaseArgs;
}) {
  const { name, provider, releaseArgs } = args;
  if (!releaseArgs.name) {
    releaseArgs.name = name;
  }
  if (releaseArgs.createNamespace) {
    _k8sNamespaces[`${provider.namespace}-${provider.cluster_uuid}`] = true;
  }
  return new kubernetes.helm.v3.Release(name, releaseArgs, {
    provider,
    ignoreChanges: ['checksum', 'version'],
    dependsOn: provider.dependsOn,
    deleteBeforeReplace: true,
  });
}
