import * as kubernetes from '@pulumi/kubernetes';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { K8sProvider, getK8sProvider } from './provider';

export const _k8sNamespaces = {};

export function createK8sNamespace(args: {
  provider: K8sProvider;
  name?: string;
  labels?: Record<string, string>;
}): kubernetes.core.v1.Namespace {
  const { labels } = args;

  const aliases = [];

  let name = args.name;
  let provider = args.provider;
  if (!name) {
    name = getNamespace(provider);
  } else if (provider) {
    aliases.push({ name: `${name}-${provider.cluster_uuid}` });
    aliases.push({ name: `namespace-${provider.uuid}` });
    provider = getK8sProvider({ provider, namespace: name });
  }
  const clusterKey = `${name}-${provider.cluster_uuid}`;

  if (_k8sNamespaces[clusterKey]) return _k8sNamespaces[clusterKey];
  const namespace = new kubernetes.core.v1.Namespace(
    clusterKey,
    {
      metadata: {
        name: name,
        labels: {
          ...labels,
        },
      },
    },
    {
      provider: provider,
      aliases,
    }
  );
  _k8sNamespaces[clusterKey] = namespace;
  return namespace;
}

export function getNamespace(provider?: K8sProvider) {
  const { serviceId, isAService } = getConfigs();
  if (provider?.namespace) return provider.namespace;
  return !isAService ? 'default' : `${getUniqueNameInProject(serviceId)}-ns`;
}
