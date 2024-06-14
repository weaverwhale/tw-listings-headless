import * as kubernetes from '@pulumi/kubernetes';
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { TracerOptions } from '@tw/types';
import { convertEnvs } from '../utils/helpers';
import { K8sProvider } from './provider';
import { getDDEnvs } from '../datadog/envs';
import { getNamespace } from './namespace';
import { getConfigs } from '../utils';
import { K8sCPU } from './types';
import { getServiceDefaultEnvs, serviceEnvs } from '../service/serviceEnvs';
import { toJSONOutput, toYamlOutput } from '../pulumi-utils';

export function getK8sDeploymentEnvs(args: {
  provider: K8sProvider;
  deploymentName: string;
  envs?: Record<string, any>;
  datadogConfig?: TracerOptions | 'false';
  secretVersion?: gcp.secretmanager.SecretVersion;
}) {
  const { envs = [], provider, datadogConfig, secretVersion, deploymentName } = args;
  const { serviceConfig, isSensory, serviceId } = getConfigs();
  const deploymentEnvs: kubernetes.types.input.core.v1.EnvVar[] = [
    { name: 'IS_K8S', value: 'true' },
    { name: 'DD_AGENT_HOST', valueFrom: { fieldRef: { fieldPath: 'status.hostIP' } } },
    { name: 'K8S_NAME', valueFrom: { fieldRef: { fieldPath: 'metadata.name' } } },
    { name: 'K8S_NAMESPACE', valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } } },
    { name: 'K8S_HOST_IP', valueFrom: { fieldRef: { fieldPath: 'status.hostIP' } } },
    { name: 'K8S_POD_IP', valueFrom: { fieldRef: { fieldPath: 'status.podIP' } } },
    { name: 'K8S_NODE_NAME', valueFrom: { fieldRef: { fieldPath: 'spec.nodeName' } } },
    { name: 'FORCE_REV', value: process.env.F },
    // TW
    { name: 'SERVICE_ID', value: serviceId },
    { name: 'TW_CLUSTER', value: provider.cluster_urn },
    { name: 'TW_DEPLOYMENT', value: deploymentName },
    ...getDDEnvs(),
    ...getServiceDefaultEnvs(),
    ...convertEnvs(serviceConfig?.env),
    ...convertEnvs(envs),
    ...convertEnvs(serviceEnvs),
  ];

  if (datadogConfig) {
    deploymentEnvs.push({ name: 'TW_DD_CONFIG', value: JSON.stringify(datadogConfig) });
  }
  if (secretVersion) {
    deploymentEnvs.push({ name: 'TW_SECRET_NAME', value: secretVersion.name });
  }
  if (isSensory) {
    deploymentEnvs.push({ name: 'IS_SENSORY', value: 'true' });
  }
  return deploymentEnvs;
}

export function k8sCpuMToString(CPU: K8sCPU): K8sCPU {
  if (typeof CPU === 'number') {
    return CPU;
  }
  const CPUNum = Number(CPU.replace('m', ''));
  if (CPUNum % 1000 === 0) {
    return CPUNum / 1000;
  }
  return CPU;
}

export function k8sCpuToNumber(CPU: K8sCPU): number {
  // if is number, return
  if (typeof CPU === 'number') {
    return CPU;
  }
  if (CPU?.endsWith('m')) {
    return Number(CPU.replace('m', '')) / 1000;
  }
  return Number(CPU);
}

export function k8sMemoryToNumberGi(memory: string): number {
  if (memory?.endsWith('Mi')) {
    return Number(memory.replace('Mi', '')) / 1024;
  }
  return Number(memory.replace('Gi', ''));
}

export function k8sMemoryToNumberMi(memory: string): number {
  if (memory?.endsWith('Gi')) {
    return Number(memory.replace('Gi', '')) * 1024;
  }
  return Number(memory.replace('Mi', ''));
}

export function k8sMemoryMiToStringGi(memoryMi: number): string {
  memoryMi = Math.floor(memoryMi);
  if (memoryMi % 1024 === 0) {
    return memoryMi / 1024 + 'Gi';
  }
  return memoryMi + 'Mi';
}

// create cluster-local dns name
export function createClusterLocalDnsName(name: string, namespace?: string): string {
  return `${name}.${namespace || getNamespace()}.svc.cluster.local`;
}

export function k8sUniqueName(name: string, provider: K8sProvider): string {
  return `${name}-${provider.uuid}`;
}

export function createConfigMap(args: {
  name: string;
  provider: K8sProvider;
  data: {
    key: string;
    data: pulumi.Input<any>;
    type: 'json' | 'yaml';
  }[];
}) {
  const { name, provider, data } = args;
  const configMap = new kubernetes.core.v1.ConfigMap(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name,
      },
      data: data.reduce((acc, { key, data: value, type }) => {
        acc[key] = type === 'json' ? toJSONOutput(value) : toYamlOutput(value);
        return acc;
      }, {}),
    },
    { provider }
  );
  return configMap;
}
