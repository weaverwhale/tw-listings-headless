import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider } from '../provider';
import { k8sUniqueName } from '../utils';

export type AffinityType = 'CLIENT_IP' | 'GENERATED_COOKIE';

export type BackendConfigArgs = {
  cdn?: {
    bypassCacheOnRequestHeaders?: {
      headerName: string;
    }[];
    cacheMode?: string;
    cachePolicy?: {
      includeHost?: boolean;
      includeProtocol?: boolean;
      includeQueryString?: boolean;
      queryStringBlacklist?: string[];
      queryStringWhitelist?: string[];
    };
    clientTtl?: number;
    defaultTtl?: number;
    enabled: boolean;
    maxTtl?: number;
    negativeCaching?: boolean;
    negativeCachingPolicy?: {
      code: number;
      ttl: number;
    }[];
    requestCoalescing?: boolean;
    serveWhileStale?: number;
    signedUrlCacheMaxAgeSec?: number;
    signedUrlKeys?: {
      keyName: string;
      keyValue: string;
      secretName: string;
    }[];
  };
  connectionDraining?: {
    drainingTimeoutSec?: number;
  };
  customRequestHeaders?: {
    headers?: string[];
  };
  customResponseHeaders?: {
    headers?: string[];
  };
  healthCheck?: {
    checkIntervalSec?: number;
    healthyThreshold?: number;
    port?: pulumi.Input<string | number>;
    requestPath?: string;
    timeoutSec?: number;
    type?: string;
    unhealthyThreshold?: number;
  };
  iap?: {
    enabled: boolean;
    oauthclientCredentials: {
      clientID?: string;
      clientSecret?: string;
      secretName: string;
    };
  };
  logging?: {
    enable?: boolean;
    sampleRate?: number;
  };
  securityPolicy?: {
    name: string;
  };
  sessionAffinity?: {
    affinityCookieTtlSec?: number;
    affinityType?: AffinityType;
  };
  timeoutSec?: number;
};

export function createK8sServiceBackendConfig(args: {
  name: string;
  spec: BackendConfigArgs;
  provider: K8sProvider;
}) {
  const { name, spec, provider } = args;
  const backendConfig = new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    {
      apiVersion: 'cloud.google.com/v1',
      kind: 'BackendConfig',
      metadata: {
        name,
      },
      spec,
    },
    { provider, aliases: [{ name }] }
  );
  return backendConfig;
}

export function createK8sIngressFrontendConfig(args: {
  name: string;
  spec: any;
  provider: kubernetes.Provider;
}) {
  const { name, spec, provider } = args;
  const frontendConfig = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'networking.gke.io/v1beta1',
      kind: 'FrontendConfig',
      metadata: {
        name,
      },
      spec,
    },
    { provider: provider }
  );
  return frontendConfig;
}
