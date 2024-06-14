import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider } from './provider';
import { createIapConfig } from './iap';
import { DependsOn, toJSONOutput } from '../pulumi-utils';
import { IngressMode } from './types';
import { k8sUniqueName } from './utils';
import { TWDomain, getLabelSafeDomain } from '../utils';
import { addDnsRecord } from '../cloudflare';
import { objectBool } from '../utils/bool';
import { DOMAIN } from './annotations';

export type AutoNegConfigEntry = {
  name: pulumi.Output<string>;
  region?: string;
  max_rate_per_endpoint?: number;
  max_connections_per_endpoint?: number;
};

export type AutoNegConfig = {
  backend_services: Record<string, AutoNegConfigEntry[]>;
};

export function createK8sService(args?: {
  provider: K8sProvider;
  name: string;
  ingressMode?: IngressMode;
  autoNeg?: AutoNegConfig;
  selector?: Record<string, string>;
  type?: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  annotations?: Record<string, pulumi.Output<string> | string>;
  twDomain?: TWDomain;
  ports?: kubernetes.types.input.core.v1.ServicePort[];
  dependsOn?: DependsOn;
  backendConfig?: kubernetes.apiextensions.CustomResource;
}): {
  k8sService: kubernetes.core.v1.Service;
} {
  const {
    provider,
    name,
    ingressMode,
    autoNeg,
    selector,
    type = 'ClusterIP',
    ports = [{ name: 'http-web', port: 80, targetPort: 8080 }],
    annotations = {},
    twDomain,
    dependsOn,
    backendConfig,
  } = args || {};

  const labels = {};

  if (ingressMode === 'iap') {
    createIapConfig({ provider });
  }

  // remove internal backends if region does not match
  if (autoNeg) {
    autoNeg.backend_services = Object.fromEntries(
      Object.entries(autoNeg.backend_services).map(([key, value]) => [
        key,
        value.filter((v) => !v.region || v.region === provider.location),
      ])
    );
  }

  if (autoNeg) {
    (annotations['cloud.google.com/neg'] = toJSONOutput({
      exposed_ports: { [String(ports[0].port)]: {} },
    })),
      (annotations['controller.autoneg.dev/neg'] = toJSONOutput(autoNeg));
  }
  if (backendConfig) {
    annotations['cloud.google.com/backend-config'] = toJSONOutput({
      default: backendConfig.metadata.name,
    });
  }
  if (type === 'LoadBalancer' && ingressMode === 'internal') {
    annotations['networking.gke.io/load-balancer-type'] = 'Internal';
    annotations['networking.gke.io/internal-load-balancer-allow-global-access'] = 'true';
  }
  if (!autoNeg && type !== 'LoadBalancer') {
    annotations['cloud.google.com/neg'] = '{"ingress": true}';
  }

  if (twDomain) {
    annotations[DOMAIN] = twDomain.fqdn;
    labels[DOMAIN] = getLabelSafeDomain(twDomain);
  }

  const k8sService = new kubernetes.core.v1.Service(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name: name,
        labels: objectBool(labels) ? labels : undefined,
        annotations,
      },
      spec: {
        ports,
        type,
        selector: selector || {
          'triplewhale.com/deployment': name,
        },
      },
    },
    { provider, dependsOn }
  );

  if (twDomain) {
    if (ingressMode === 'cluster-local') {
      throw new Error('Cluster-local ingress mode is not supported with TWDomain');
    }
    addDnsRecord({
      name: twDomain.fullSubDomain,
      domainName: twDomain.domain,
      type: 'A',
      value: k8sService.status.loadBalancer.ingress[0].ip,
    });
  }

  return { k8sService };
}
