import * as gcp from '@pulumi/gcp';
import { LoadBalancingScheme } from './createLoadBalancer';

export type K8sMemory = `${number}Mi` | `${number}Gi`;

export type K8sCPU = `${number}m` | number;

export interface K8sResources {
  memoryLimit?: K8sMemory;
  memoryRequest?: K8sMemory;
  CPULimit?: K8sCPU;
  CPURequest?: K8sCPU;
  GPURequest?: string;
}

export type LoadBalancerConfig = {
  ipv6?: boolean;
  loadBalancingScheme?: LoadBalancingScheme;
  logSampleRate?: number;
  whiteList?: string[];
  securityPolicy?: gcp.compute.SecurityPolicy;
};

export type IngressesConfig = {
  ingressMode?: IngressMode;
  ingressType?: IngressType;
  loadBalancerConfig?: LoadBalancerConfig;
};

export type IngressMode = 'open' | 'iap' | 'internal' | 'cluster-local';

export type IngressType = 'ingress' | 'load-balancer' | 'service';
