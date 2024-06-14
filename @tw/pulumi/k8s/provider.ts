import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';
import { getNamespace } from './namespace';
import { createUUID } from '../utils/uuid';
import { dependOnCluster } from './cluster';

// https://www.pulumi.com/registry/packages/kubernetes/how-to-guides/managing-resources-with-server-side-apply/#handle-field-conflicts-on-existing-resources
// process.env.PULUMI_K8S_ENABLE_PATCH_FORCE = 'true';

// gcloud container clusters get-credentials CLUSTER_NAME --region us-central1

const providers = {};

export const k8sClusters: Record<string, { location: string; name: string }> = {};

export type ClusterName =
  | 'backend-cluster'
  | 'knative-cluster'
  | 'temporal-cluster'
  | 'sonic-cluster'
  | 'rceaas-cluster'
  | 'pipelines-cluster';

export type K8sProvider = kubernetes.Provider & {
  namespace: string;
  location: string;
  uuid: string;
  cluster_uuid: string;
  cluster_name: ClusterName;
  cluster_urn: string;
  dependsOn: pulumi.Resource[];
  dependOn: (resource: pulumi.Resource | pulumi.Resource[]) => K8sProvider;
};

export function getK8sProvider(
  args: {
    namespace?: string;
    cluster?: ClusterName;
    location?: string;
    resource?: any;
    provider?: K8sProvider;
    projectId?: string;
    dependsOn?: pulumi.Resource[];
  } = {}
): K8sProvider {
  const {
    cluster = 'backend-cluster',
    resource,
    location = getConfigs().location,
    projectId = getConfigs().projectId,
  } = args;
  if (resource) {
    return resource.getProvider('kubernetes::') as K8sProvider;
  }
  const dependsOn = [...(args.dependsOn || [])];
  if (args.provider) {
    dependsOn.push(...(args.provider.dependsOn || []));
    const { namespace, cluster, location, provider } = args;
    return getK8sProvider({
      namespace: namespace || provider.namespace,
      cluster: cluster || provider.cluster_name,
      location: location || provider.location,
      dependsOn,
    });
  }

  const namespace = args.namespace || getNamespace();
  const name = `${namespace}-${cluster}-${location}`;
  if (providers[name]) {
    if (dependsOn.length) {
      const providerClone = cloneProvider(providers[name]);
      providerClone.dependsOn = dependsOn;
      return providerClone;
    }
    return providers[name];
  }
  const cluster_urn = `gke_${projectId}_${location}_${cluster}`;
  const provider = new kubernetes.Provider(
    name,
    {
      cluster: cluster_urn,
      context: cluster_urn,
      namespace,
      kubeClientSettings: { qps: 1000, burst: 3000 },
      enableServerSideApply: false,
    },
    {
      dependsOn,
      // will be different in cloud build from local
      // ignoring is a prob, TODO: figure out how to handle this
      //ignoreChanges: ['kubeconfig']
    }
  ) as K8sProvider;
  // includes namespace
  provider.uuid = createUUID(name);
  // does not include namespace
  provider.cluster_uuid = createUUID(cluster_urn);
  provider.cluster_name = cluster;
  provider.cluster_urn = cluster_urn;
  provider.location = location;
  provider.namespace = namespace;
  provider.dependsOn = dependsOn;
  provider.dependOn = (resource: pulumi.Resource | pulumi.Resource[]) => {
    if (!resource) return provider;
    if (!Array.isArray(resource)) resource = [resource];
    if (!resource.length) return provider;
    const providerClone = cloneProvider(provider);
    providerClone.dependsOn = resource;
    return providerClone;
  };
  providers[name] = provider;
  if (!k8sClusters[cluster_urn]) {
    k8sClusters[cluster_urn] = {
      location,
      name: cluster,
    };
  }
  return dependOnCluster(provider, provider.cluster_name);
}

function cloneProvider(provider: K8sProvider) {
  return Object.assign(Object.create(Object.getPrototypeOf(provider)), provider);
}
