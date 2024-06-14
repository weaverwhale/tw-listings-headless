import * as gcp from '@pulumi/gcp';
import * as kubernetes from '@pulumi/kubernetes';
import { createLabels, getConfigs, getNetworkId, getSubnetworkId } from '../../utils';
import { isProduction } from '../../constants';
import { createUUID } from '../../utils/uuid';
import { ClusterName, K8sProvider, getK8sProvider } from '../provider';
import { defaultOauthScopes } from './nodePool';

export type K8sCluster = gcp.container.Cluster & {
  name_str: string;
  cluster_urn: string;
  cluster_uuid: string;
};

const clusters: Record<string, K8sCluster> = {};

export function createK8sCluster(args: {
  name: ClusterName;
  masterIpv4CidrBlock: string;
  stackType?: 'IPV4_IPV6' | 'IPV4' | 'IPV6';
  location?: string;
  autoscalingProfile?: 'BALANCED' | 'OPTIMIZE_UTILIZATION';
  masterOpen?: boolean;
  nodeLocations?: string[];
  createBackup?: boolean;
  nap?: boolean;
  resourceLimits?: gcp.types.input.container.ClusterClusterAutoscalingResourceLimit[];
  network?: string;
}) {
  const {
    name,
    stackType = 'IPV4_IPV6',
    masterIpv4CidrBlock,
    location = getConfigs().location,
    autoscalingProfile,
    masterOpen = true,
    nodeLocations,
    nap = true,
    createBackup = false,
    network = 'app',
  } = args;
  const { projectId } = getConfigs();
  const cluster_urn = `gke_${projectId}_${location}_${name}`;
  const provider = getK8sProvider({ cluster: name as any, location });
  const autoProvisioningDefaults: gcp.types.input.container.ClusterClusterAutoscalingAutoProvisioningDefaults =
    nap
      ? {
          upgradeSettings: {
            maxSurge: 10,
          },
          oauthScopes: defaultOauthScopes,
          shieldedInstanceConfig: {
            enableIntegrityMonitoring: true,
            enableSecureBoot: false,
          },
        }
      : undefined;

  if (nap && !args.resourceLimits) {
    args.resourceLimits = [
      {
        resourceType: 'cpu',
        minimum: 1,
        maximum: 3000,
      },
      {
        resourceType: 'memory',
        minimum: 1,
        maximum: 12000,
      },
    ];
  }
  const cluster = new gcp.container.Cluster(
    `${name}-${location}`,
    {
      location,
      initialNodeCount: 1,
      workloadIdentityConfig: {
        workloadPool: `${projectId}.svc.id.goog`,
      },
      name,
      resourceLabels: createLabels(),
      subnetwork: getSubnetworkId(`${network}-dual`, location),
      network: getNetworkId(network),
      datapathProvider: 'ADVANCED_DATAPATH',
      enableL4IlbSubsetting: true,
      privateClusterConfig: {
        enablePrivateEndpoint: false,
        enablePrivateNodes: true,
        masterGlobalAccessConfig: {
          enabled: true,
        },
        masterIpv4CidrBlock,
      },
      nodeLocations,
      nodePoolDefaults: {
        nodeConfigDefaults: {
          gcfsConfig: {
            enabled: true,
          },
        },
      },
      masterAuthorizedNetworksConfig: {
        ...(masterOpen
          ? {
              cidrBlocks: [
                {
                  cidrBlock: '0.0.0.0/0',
                  displayName: 'all',
                },
              ],
            }
          : null),
      },
      clusterAutoscaling: {
        autoProvisioningDefaults,
        enabled: nap,
        autoscalingProfile:
          autoscalingProfile || (isProduction ? 'BALANCED' : 'OPTIMIZE_UTILIZATION'),
        resourceLimits: args.resourceLimits,
      },
      costManagementConfig: { enabled: true },
      removeDefaultNodePool: true,
      ipAllocationPolicy: {
        stackType,
      },
      project: projectId,
      monitoringConfig: {
        enableComponents: ['SYSTEM_COMPONENTS'],
        managedPrometheus: {
          enabled: true,
        },
      },
      addonsConfig: {
        dnsCacheConfig: {
          enabled: true,
        },
        gkeBackupAgentConfig: {
          enabled: true,
        },
      },
    },
    { aliases: [{ name }], protect: true }
  ) as K8sCluster;
  cluster.name_str = name;
  cluster.cluster_urn = cluster_urn;
  cluster.cluster_uuid = createUUID(cluster_urn);

  clusters[name] = cluster;
  new kubernetes.scheduling.v1.PriorityClass(
    `system-${cluster.cluster_uuid}`,
    {
      metadata: {
        name: 'system',
      },
      value: 1000000,
      globalDefault: false,
    },
    { provider, dependsOn: cluster }
  );

  if (createBackup) {
    new gcp.gkebackup.BackupPlan(`${name}-${location}`, {
      cluster: cluster.id,
      location: location,
      backupSchedule: {
        cronSchedule: '55 23 * * *', // 23:55
      },
      retentionPolicy: {
        backupRetainDays: 7,
      },
      labels: createLabels(),
      backupConfig: {
        includeVolumeData: false,
        includeSecrets: true,
        allNamespaces: true,
      },
    });
  }

  return { cluster, provider };
}

export function dependOnCluster(provider: K8sProvider, cluster: ClusterName) {
  return provider.dependOn(clusters[cluster]);
}
