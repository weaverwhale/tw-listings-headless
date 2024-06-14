import * as gcp from '@pulumi/gcp';
import * as random from '@pulumi/random';
import * as pulumi from '@pulumi/pulumi';
import { createLabels, getConfigs } from '../../utils';
import { K8sProvider } from '../provider';
import { isStaging } from '../../constants';

export type NodePool = gcp.container.NodePool & {
  taints?: gcp.types.input.container.NodePoolNodeConfigTaint[];
  poolTarget?: pulumi.Input<string>;
};

export const allNodeLocations = [
  'us-central1-a',
  'us-central1-b',
  'us-central1-c',
  'us-central1-f',
];

export type Ratios = '1-1' | '1-2' | '1-4' | '1-8';

export const ratios: Ratios[] = ['1-1', '1-2', '1-4', '1-8'];

export const nodePoolRatios: Record<string, Ratios> = {
  'e2-custom-16-32768': '1-2',
  'e2-custom-8-32768': '1-4',
};

// https://cloud.google.com/compute/docs/access/service-accounts#default_scopes
export const defaultOauthScopes = [
  'https://www.googleapis.com/auth/devstorage.read_only',
  'https://www.googleapis.com/auth/logging.write',
  'https://www.googleapis.com/auth/monitoring',
  'https://www.googleapis.com/auth/service.management.readonly',
  'https://www.googleapis.com/auth/servicecontrol',
  'https://www.googleapis.com/auth/trace.append',
];

export function createNodePool(args: {
  provider: K8sProvider;
  machineType: string;
  name?: string;
  minNodeCount?: number;
  maxNodeCount?: number;
  locationPolicy?: 'ANY' | 'BALANCED';
  spot?: boolean;
  isPrivate?: boolean;
  poolTargetValue?: string;
  nodeLocations?: string[];
  labels?: Record<string, string>;
  features?: {
    noDD?: boolean;
    otel?: boolean;
  };
  ratio?: Ratios;
  projectId?: string;
  guestAccelerators?: gcp.types.input.container.NodePoolNodeConfigGuestAccelerator[];
  retainOnDelete?: boolean;
}): { nodePool: NodePool; taints: gcp.types.input.container.NodePoolNodeConfigTaint[] } {
  const {
    provider,
    machineType,
    minNodeCount = 0,
    maxNodeCount = 20,
    locationPolicy = 'ANY',
    spot = isStaging,
    poolTargetValue,
    isPrivate,
    features = {},
    nodeLocations,
    guestAccelerators,
    retainOnDelete,
    projectId = getConfigs().projectId,
  } = args;
  const { isAService, serviceId } = getConfigs();
  let name = `${args.name || machineType}-${provider.uuid}`;
  const { machineFamily, ratio } = getMachineTypeInfo(machineType);
  let useName = '';
  if (isAService) {
    useName = `${serviceId}-${name}`;
  } else if (spot) {
    name = `${name}-spot`;
  }

  const machineRatio = args.ratio || ratio || nodePoolRatios[machineType];

  if (!machineRatio) {
    throw new Error(`No machine ratio found for ${machineType}`);
  }

  const { noDD, otel } = features;

  const poolTarget =
    poolTargetValue || new random.RandomString(name, { length: 8, special: false }).id;

  const labels = {
    'machine-type': machineType,
    'machine-family': machineFamily,
    'machine-ratio': machineRatio,
    'triplewhale.com/pool-target': poolTarget,
    projectId,
    ...args.labels,
  };

  if (noDD) {
    labels['triplewhale.com/no-dd'] = 'true';
  }

  if (otel) {
    labels['triplewhale.com/otel'] = 'true';
  }

  const taints: gcp.types.input.container.NodePoolNodeConfigTaint[] = [];
  if (isPrivate) {
    taints.push({
      key: 'triplewhale.com/private-pool',
      value: poolTarget,
      effect: 'NO_SCHEDULE',
    });
    labels['triplewhale.com/private-pool'] = poolTarget;
  }
  if (spot) {
    taints.push({
      key: 'cloud.google.com/gke-spot',
      value: 'true',
      effect: 'NO_SCHEDULE',
    });
  }
  if (machineFamily !== 'e2' && !isPrivate && !guestAccelerators?.length) {
    taints.push({
      key: 'cloud.google.com/machine-family',
      value: machineFamily,
      effect: 'NO_SCHEDULE',
    });
  }

  const nodePool: NodePool = new gcp.container.NodePool(
    name,
    {
      ...(useName ? { name: useName } : null),
      location: provider.location,
      nodeLocations,
      cluster: provider.cluster_name,
      project: projectId,
      nodeConfig: {
        labels,
        resourceLabels: {
          ...createLabels(),
        },
        taints,
        machineType: machineType,
        oauthScopes: defaultOauthScopes,
        guestAccelerators,
        workloadMetadataConfig: {
          mode: 'GKE_METADATA',
        },
        spot,
      },
      upgradeSettings: {
        maxSurge: 10,
      },
      initialNodeCount: minNodeCount,
      autoscaling: {
        locationPolicy: locationPolicy,
        totalMaxNodeCount: maxNodeCount || minNodeCount * 2,
        totalMinNodeCount: minNodeCount,
      },
    },
    {
      ignoreChanges: ['initialNodeCount'],
      retainOnDelete,
      deleteBeforeReplace: Boolean(useName),
    }
  );
  nodePool.taints = taints;
  nodePool.poolTarget = poolTarget;

  return { nodePool, taints };
}

export function getSelectorsForNodePool(nodePool: NodePool) {
  const nodeSelector = {
    'triplewhale.com/pool-target': nodePool.poolTarget,
  };
  const tolerations = [];
  nodePool.taints.forEach((taint) => {
    tolerations.push({
      key: taint.key,
      operator: 'Equal',
      value: taint.value,
      effect: 'NoSchedule',
    });
  });
  return { tolerations, nodeSelector };
}

export function getSelectorsForPrivatePoolParty(args: { bouncer?: void; friendlyName: string }) {
  const id = new random.RandomString(args.friendlyName, { length: 8, special: false }).id;
  const nodeSelector = {
    'triplewhale.com/private-pool': id,
  };
  const tolerations = [
    {
      key: 'triplewhale.com/private-pool',
      operator: 'Equal',
      effect: 'NoSchedule',
      value: id,
    },
  ];
  return { tolerations, nodeSelector };
}

export function getMachineTypeInfo(machineType: string): {
  machineFamily: string;
  machineClass: string;
  memory: string;
  cpu: string;
  ratio: Ratios;
} {
  let ratio: Ratios | undefined;
  let [machineFamily, machineClass, cpu, memory] = machineType.split('-');
  if (machineClass !== 'custom') {
    if (machineClass === 'highcpu') {
      ratio = '1-1';
      memory = cpu;
    } else if (machineClass === 'standard') {
      ratio = '1-4';
      memory = String(Number(memory) * 4);
    } else if (machineClass === 'highmem') {
      ratio = '1-8';
      memory = String(Number(memory) * 8);
    } else {
      ratio = '1-1';
    }
  }
  return { machineFamily, machineClass, memory, cpu, ratio };
}
