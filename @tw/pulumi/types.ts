import * as gcp from '@pulumi/gcp';
import * as kubernetes from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import { ServiceEntryDeployment } from '@tw/types';

export const CloudRun = gcp.cloudrun.Service;

export const K8sIngress = kubernetes.networking.v1.Ingress;

export const K8sService = kubernetes.core.v1.Service;

export const K8sDeployment = kubernetes.apps.v1.Deployment;

export type authProxyConfig = { serviceId: string; projectId?: string };

export type serviceTarget =
  | gcp.cloudrun.Service
  | kubernetes.networking.v1.Ingress
  | kubernetes.core.v1.Service
  | ServiceEntryDeployment;
