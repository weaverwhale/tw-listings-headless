import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { NodePool, getSelectorsForNodePool, nodePoolRatios } from './cluster';
import { K8sCPU, K8sResources } from './types';
import { isStaging } from '../constants';
import { addEnvIfNotExists, getConfigs, sortEnvs } from '../utils';
import { getServiceImage } from '../utils/getServiceImage';
import { objectBool } from '../utils/bool';
import {
  k8sCpuMToString,
  k8sCpuToNumber,
  k8sMemoryMiToStringGi,
  k8sMemoryToNumberGi,
  k8sMemoryToNumberMi,
} from './utils';

export type K8sNodeSelector = {
  'node.kubernetes.io/instance-type'?: string;
  'cloud.google.com/machine-family'?: 'e2' | 'c2' | 'c3';
  'cloud.google.com/gke-accelerator'?: 'nvidia-tesla-a100' | 'nvidia-l4' | 'nvidia-tesla-v100';
  'iam.gke.io/gke-metadata-server-enabled'?: string;
  'addon.gke.io/node-local-dns-ds-ready'?: string;
  'topology.kubernetes.io/zone'?: pulumi.Input<string>;
  'triplewhale.com/private-pool'?: pulumi.Input<string>;
};

export type PodTemplateArgs = {
  image?: pulumi.Input<string>;
  appName?: string;
  terminationGracePeriodSeconds?: number;
  livenessProbe?: boolean;
  readinessProbe?: boolean;
  livenessProbeFailureThreshold?: number;
  livenessProbePeriodSeconds?: number;
  envs?: kubernetes.types.input.core.v1.EnvVar[];
  k8sServiceAccountName?: pulumi.Input<string>;
  k8sSecret?: kubernetes.apiextensions.CustomResource;
  podInfo?: boolean;
  nodeSelector?: K8sNodeSelector;
  initialDelaySeconds?: number;
  nodePool?: NodePool;
  tolerations?: pulumi.Input<kubernetes.types.input.core.v1.Toleration>[];
  useTcpProbe?: boolean;
  persistentVolumeClaims?: {
    claim: kubernetes.core.v1.PersistentVolumeClaim;
    mountPath: string;
  }[];
  extraVolumes?: (kubernetes.types.input.core.v1.Volume & { path: string })[];
  otel?: boolean;
  allowSpot?: boolean;
  readinessGates?: kubernetes.types.input.core.v1.PodReadinessGate[];
  labels?: Record<string, string>;
  annotations?: Record<string, pulumi.Input<string>>;
  command?: string[];
  args?: pulumi.Input<string>[];
  ports?: kubernetes.types.input.core.v1.ContainerPort[];
  scalesOnMemory?: boolean;
  hostNetwork?: boolean;
} & K8sResources;

export function createPodTemplate(args: PodTemplateArgs) {
  const {
    image = getServiceImage(),
    envs = [],
    appName = getConfigs().serviceId,
    terminationGracePeriodSeconds,
    // total 3 minutes
    livenessProbeFailureThreshold = 10,
    livenessProbePeriodSeconds = 18,
    k8sServiceAccountName,
    k8sSecret,
    podInfo,
    initialDelaySeconds = 5,
    nodePool,
    allowSpot,
    otel,
    tolerations = [],
    useTcpProbe = true,
    persistentVolumeClaims = [],
    extraVolumes = [],
    readinessGates,
    labels = {},
    annotations = {},
    ports = [{ containerPort: 8080 }],
    scalesOnMemory,
    hostNetwork,
  } = args;

  // if theres no ports then assume no probes
  let { livenessProbe, readinessProbe } = args;
  if (livenessProbe === undefined) {
    if (ports.length) {
      livenessProbe = true;
    }
  }
  if (readinessProbe === undefined) {
    if (ports.length) {
      readinessProbe = true;
    }
  }

  const probe: kubernetes.types.input.core.v1.Probe = !ports.length
    ? null
    : useTcpProbe
    ? {
        tcpSocket: {
          port: ports[0].containerPort,
        },
      }
    : {
        httpGet: {
          path: '/ping',
          port: ports[0].containerPort,
        },
      };

  const { memoryLimit, memoryRequest, CPURequest, CPULimit, GPURequest } = resourceCalc({
    CPULimit: args.CPULimit,
    CPURequest: args.CPURequest,
    memoryLimit: args.memoryLimit,
    memoryRequest: args.memoryRequest,
    GPURequest: args.GPURequest,
  });

  const useSpot = allowSpot || ((isStaging || nodePool?.nodeConfig?.spot) && allowSpot !== false);
  let nodeSelector: K8sNodeSelector = {
    'iam.gke.io/gke-metadata-server-enabled': 'true',
    'addon.gke.io/node-local-dns-ds-ready': 'true',
  };

  if (nodePool) {
    const { nodeSelector: nodePoolSelectors, tolerations: nodePoolTolerations } =
      getSelectorsForNodePool(nodePool);
    nodeSelector = { ...nodeSelector, ...nodePoolSelectors };
    tolerations.push(...nodePoolTolerations);
  } else if (args.nodeSelector) {
    nodeSelector = { ...nodeSelector, ...args.nodeSelector };
  }

  if (
    !nodeSelector['node.kubernetes.io/instance-type'] &&
    !nodeSelector['cloud.google.com/gke-nodepool'] &&
    !nodeSelector['cloud.google.com/machine-family'] &&
    !GPURequest
  ) {
    nodeSelector['cloud.google.com/machine-family'] = 'e2';
    // nodeSelector['node.kubernetes.io/instance-type'] = getRatioMachineType(
    //   memoryRequest,
    //   CPURequest
    // );
  }

  if (persistentVolumeClaims?.length) {
    for (const claim of persistentVolumeClaims) {
      nodeSelector['topology.kubernetes.io/zone'] = claim.claim.metadata.labels.apply(
        (labels) => labels['triplewhale.com/disk-zone']
      );
    }
  }

  if (otel) {
    nodeSelector['triplewhale.com/otel'] = 'true';
    addEnvIfNotExists(envs, {
      name: 'TW_OTEL_NODE',
      value: '1',
    });
  }

  for (const [key, value] of Object.entries(nodeSelector)) {
    // for gke nap, all custom labels should be added to tolerations
    if (key.startsWith('triplewhale.com/')) {
      tolerations.push({
        key,
        operator: 'Equal',
        value,
        effect: 'NoSchedule',
      });
    }
  }

  if (useSpot) {
    tolerations.push({
      key: 'triplewhale.com/spot-pool',
      operator: 'Equal',
      value: 'true',
      effect: 'NoSchedule',
    });
    tolerations.push({
      key: 'cloud.google.com/gke-spot',
      operator: 'Equal',
      value: 'true',
      effect: 'NoSchedule',
    });
    nodeSelector['cloud.google.com/gke-spot'] = 'true';
    envs.push({
      name: 'IS_SPOT',
      value: 'true',
    });
  }

  if (
    nodeSelector['cloud.google.com/machine-family'] &&
    nodeSelector['cloud.google.com/machine-family'] !== 'e2'
  ) {
    tolerations.push({
      key: 'cloud.google.com/machine-family',
      operator: 'Equal',
      value: nodeSelector['cloud.google.com/machine-family'],
      effect: 'NoSchedule',
    });
  }

  // not limit as usage should hover around request not limit, limit will be for spike in live objects
  // in nodejs
  // for temporal worker it wants to set it itself
  addEnvIfNotExists(envs, {
    name: 'TW_MEM_REQUEST',
    value: String(k8sMemoryToNumberMi(scalesOnMemory ? memoryRequest : memoryLimit)),
  });

  envs.push({ name: 'DOCKER_IMAGE', value: image });

  if (k8sSecret) {
    annotations['triplewhale.com/trigger-secret'] = k8sSecret.metadata.generation.apply(String);
  }

  const volumes: kubernetes.types.input.core.v1.Volume[] = [];
  if (podInfo) {
    volumes.push({
      name: 'podinfo',
      downwardAPI: {
        items: [
          {
            path: 'labels',
            fieldRef: {
              fieldPath: 'metadata.labels',
            },
          },
          {
            path: 'annotations',
            fieldRef: {
              fieldPath: 'metadata.annotations',
            },
          },
        ],
      },
    });
  }
  if (k8sSecret) {
    volumes.push({
      name: 'secret',
      csi: {
        driver: 'secrets-store.csi.k8s.io',
        readOnly: true,
        volumeAttributes: { secretProviderClass: k8sSecret.metadata.name },
      },
    });
  }

  if (persistentVolumeClaims.length) {
    volumes.push(
      ...persistentVolumeClaims.map((d) => {
        return {
          name: d.claim.metadata.name,
          persistentVolumeClaim: {
            claimName: d.claim.metadata.name,
            readOnly: d.claim.spec.accessModes.apply((v) => v.includes('ReadOnlyMany')),
          },
        };
      })
    );
  }

  if (extraVolumes.length) {
    volumes.push(...extraVolumes);
  }

  const volumeMounts: kubernetes.types.input.core.v1.VolumeMount[] = [];
  if (podInfo) {
    volumeMounts.push({
      name: 'podinfo',
      mountPath: '/tw/podinfo',
    });
  }

  if (k8sSecret) {
    volumeMounts.push({ mountPath: '/etc/secrets', name: 'secret' });
  }

  if (persistentVolumeClaims.length) {
    volumeMounts.push(
      ...persistentVolumeClaims.map((d) => {
        return {
          name: d.claim.metadata.name,
          mountPath: d.mountPath,
          readOnly: d.claim.spec.accessModes.apply((v) => v.includes('ReadOnlyMany')),
        };
      })
    );
  }

  if (extraVolumes.length) {
    volumeMounts.push(
      ...extraVolumes.map((d) => {
        return {
          name: d.name,
          mountPath: d.path,
        };
      })
    );
  }

  const podTemplate: kubernetes.types.input.core.v1.PodTemplateSpec = {
    metadata: {
      labels: {
        'app.kubernetes.io/part-of': appName,
        ...labels,
      },
      annotations: objectBool(annotations) ? annotations : undefined,
    },
    spec: {
      hostNetwork,
      nodeSelector,
      tolerations: tolerations.length ? tolerations : undefined,
      terminationGracePeriodSeconds,
      serviceAccountName: k8sServiceAccountName,
      readinessGates,
      containers: [
        {
          image,
          imagePullPolicy: 'Always',
          ...(readinessProbe && probe
            ? {
                readinessProbe: {
                  ...probe,
                  failureThreshold: 1,
                  initialDelaySeconds: initialDelaySeconds,
                  periodSeconds: 2,
                },
              }
            : null),
          ...(livenessProbe && probe
            ? {
                livenessProbe: {
                  ...probe,
                  failureThreshold: livenessProbeFailureThreshold,
                  initialDelaySeconds: initialDelaySeconds || 60,
                  periodSeconds: livenessProbePeriodSeconds,
                },
              }
            : null),
          name: 'default',
          ports: ports.length ? ports : undefined,
          command: args.command,
          args: args.args,
          env: sortEnvs(envs),
          volumeMounts: volumeMounts.length ? volumeMounts : undefined,
          lifecycle: {
            preStop: {
              exec: { command: ['touch', '/tmp/tw-sigterm'] },
            },
          },
          resources: {
            requests: {
              cpu: String(CPURequest),
              memory: memoryRequest,
              ...(GPURequest ? { 'nvidia.com/gpu': GPURequest } : null),
            },
            limits: {
              memory: memoryLimit,
              ...(CPULimit ? { cpu: String(CPULimit) } : null),
              ...(GPURequest ? { 'nvidia.com/gpu': GPURequest } : null), // must be the some as req
            },
          },
        },
      ],
      volumes: volumes.length ? volumes : undefined,
    },
  };
  return podTemplate;
}

function getRatioMachineType(memoryRequest: string, CPURequest: K8sCPU): string {
  let memoryGb = 0;
  let cpu = 0;
  memoryGb = k8sMemoryToNumberGi(memoryRequest);
  cpu = k8sCpuToNumber(CPURequest);
  const memoryRatio = Math.round(memoryGb / cpu);
  const ratio = '1-' + String(findNearestHigherRatio(memoryRatio));
  let machineType;
  for (const [key, value] of Object.entries(nodePoolRatios)) {
    if (value === ratio && key.startsWith('e2')) {
      machineType = key;
      break;
    }
  }
  return machineType;
}

function findNearestHigherRatio(memoryRatio: number): number {
  const availableRatios = Object.values(nodePoolRatios).map((rat) => rat.split('-').map(Number)[1]);
  if (availableRatios.includes(memoryRatio)) {
    return memoryRatio;
  }
  availableRatios.sort((a, b) => a - b);
  const higherRatios = availableRatios.filter((num) => num > memoryRatio);
  if (!higherRatios.length) {
    return availableRatios.pop();
  }
  return Math.min(...higherRatios);
}

export function resourceCalc(args: K8sResources) {
  const { memoryLimit, memoryRequest = '512Mi', CPULimit, CPURequest = '500m', GPURequest } = args;
  const result = {
    memoryRequest: k8sMemoryMiToStringGi(k8sMemoryToNumberMi(memoryRequest)),
    memoryLimit: k8sMemoryMiToStringGi(
      k8sMemoryToNumberMi(memoryLimit ?? k8sMemoryToNumberMi(memoryRequest) * 4 + 'Mi')
    ),
    CPURequest: k8sCpuMToString(CPURequest),
    CPULimit:
      CPULimit !== null
        ? k8sCpuMToString(
            (k8sCpuToNumber(CPULimit ?? k8sCpuToNumber(CPURequest) * 2) * 1000 + 'm') as K8sCPU
          )
        : null,
    GPURequest,
  };
  return result;
}
