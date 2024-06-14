import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { addDnsRecord } from '../cloudflare';
import { DOMAIN, HOST } from './annotations';
import { createK8sManagedCertificate } from './cert';
import { K8sProvider } from './provider';
import { createK8sService } from './service';
import { TWDomain, getLabelSafeDomain } from '../utils';
import { IngressMode } from './types';
import {
  AffinityType,
  BackendConfigArgs,
  createK8sIngressFrontendConfig,
  createK8sServiceBackendConfig,
} from './gke';
import { DependsOn } from '../pulumi-utils';
import { objectBool } from '../utils/bool';
import { k8sUniqueName } from './utils';

export function createK8sIngress(args: {
  provider: K8sProvider;
  name: string;
  twDomain: TWDomain;
  ingressMode?: IngressMode;
  selector?: Record<string, string>;
  port?: number;
  targetPort?: number;
  healthCheckPath?: string;
  sessionAffinity?: AffinityType;
  dependsOn?: DependsOn;
  rules?: kubernetes.types.input.networking.v1.IngressRule[];
}) {
  const {
    provider,
    name,
    ingressMode = 'internal',
    twDomain,
    selector = { 'triplewhale.com/deployment': name },
    port = 80,
    targetPort = 8080,
    healthCheckPath = '/ping',
    sessionAffinity,
    dependsOn,
    rules,
  } = args;
  const labels = {};

  let ingressName = name;
  if (ingressMode !== 'internal') {
    ingressName += '-' + ingressMode;
  }

  const backendConfigArgs: BackendConfigArgs = {
    healthCheck: {
      checkIntervalSec: 1,
      timeoutSec: 1,
      healthyThreshold: 1,
      unhealthyThreshold: 1,
      type: 'HTTP',
      requestPath: healthCheckPath,
      port: targetPort,
    },
    timeoutSec: 3600,
  };

  if (sessionAffinity) {
    backendConfigArgs.sessionAffinity = {
      affinityCookieTtlSec: 86400,
      affinityType: sessionAffinity,
    };
  }

  if (ingressMode === 'iap') {
    backendConfigArgs.iap = {
      enabled: true,
      oauthclientCredentials: {
        secretName: 'iap-config',
      },
    };
  }

  const backendConfig = createK8sServiceBackendConfig({
    name: `${ingressName}-backend-config`,
    spec: backendConfigArgs,
    provider,
  });

  const { k8sService } = createK8sService({
    ingressMode,
    name: ingressName,
    provider: provider,
    selector,
    ports: [
      {
        name: 'http-web',
        port,
        targetPort,
      },
    ],
    dependsOn,
    backendConfig,
  });

  const host = twDomain.fqdn;

  const annotations = {
    [HOST]: host,
  };

  if (['open', 'iap'].includes(ingressMode)) {
    const frontendConfig = createK8sIngressFrontendConfig({
      name: `${ingressName}-ingress-frontend-config`,
      spec: {
        redirectToHttps: {
          enabled: ingressMode === 'open',
        },
      },
      provider,
    });

    const ssl = createK8sManagedCertificate({
      name: `${ingressName}-managed-ssl-ingress`,
      domains: [host],
      provider,
    });
    annotations['networking.gke.io/managed-certificates'] = ssl.metadata.name;
    annotations['networking.gke.io/v1beta1.FrontendConfig'] = frontendConfig.metadata.name;
  } else {
    annotations['kubernetes.io/ingress.class'] = 'gce-internal';
  }

  if (twDomain) {
    annotations[DOMAIN] = twDomain.fqdn;
    labels[DOMAIN] = getLabelSafeDomain(twDomain);
  }

  const k8sIngress = new kubernetes.networking.v1.Ingress(
    ingressName,
    {
      apiVersion: 'networking.k8s.io/v1',
      metadata: {
        annotations,
        labels: objectBool(labels) ? labels : undefined,
        name: ingressName,
      },
      spec: {
        defaultBackend: {
          service: {
            name: k8sService.metadata.name,
            port: { number: k8sService.spec.ports[0].port },
          },
        },
        rules,
      },
    },
    { provider: provider, dependsOn }
  );

  addDnsRecord({
    name: twDomain.fullSubDomain,
    domainName: twDomain.domain,
    type: 'A',
    value: k8sIngress.status.loadBalancer.ingress[0].ip,
    proxied: ingressMode === 'iap' && false,
  });

  return { k8sIngress, k8sService };
}

export function getIngressUrl(
  k8sIngress: kubernetes.networking.v1.Ingress | kubernetes.core.v1.Service
) {
  const secure = k8sIngress.metadata.annotations['networking.gke.io/managed-certificates'].apply(
    (v) => Boolean(v)
  );
  return secure.apply(
    (s) => pulumi.interpolate`http${s ? 's' : ''}://${k8sIngress.metadata.annotations[HOST]}`
  );
}

export function createAllowAllNetworkPolicy(provider: K8sProvider) {
  return new kubernetes.networking.v1.NetworkPolicy(
    k8sUniqueName('allow-all-ingress', provider),
    {
      apiVersion: 'networking.k8s.io/v1',
      metadata: {
        name: 'allow-all-ingress',
      },
      spec: {
        podSelector: {},
        policyTypes: ['Ingress'],
        ingress: [{}],
      },
    },
    { provider }
  );
}
