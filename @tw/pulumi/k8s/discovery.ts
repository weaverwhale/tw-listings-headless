import * as kubernetes from '@pulumi/kubernetes';
import { ServiceEntryDeployment } from '@tw/types';
import { TWDomain, createTWDomain, getBaseUrl, getConfigs } from '../utils';
import { createLoadBalancerForK8s } from './createLoadBalancer';
import { createK8sIngress } from './ingress';
import { K8sProvider } from './provider';
import { AutoNegConfigEntry, createK8sService } from './service';
import { addDnsRecord, dnsUrl } from '../cloudflare';
import { IngressMode, IngressType, LoadBalancerConfig } from './types';
import { HOST } from './annotations';

export function k8sDiscovery(args: {
  name: string;
  deployment: ServiceEntryDeployment;
  ingressMode?: IngressMode;
  ingressType?: IngressType;
  provider: K8sProvider;
  domain: TWDomain;
  loadBalancerConfig?: LoadBalancerConfig;
  useTcpProbe?: boolean;
  selector?: Record<string, string>;
}): {
  k8sIngress?: kubernetes.networking.v1.Ingress;
  k8sService?: kubernetes.core.v1.Service;
  autoNegConfigEntry?: AutoNegConfigEntry;
} {
  const {
    name,
    deployment,
    ingressMode,
    provider,
    domain,
    loadBalancerConfig = {},
    useTcpProbe,
    selector = { 'triplewhale.com/deployment': name },
  } = args;

  let subDomain = args.domain.subDomain;

  const { serviceId } = getConfigs();
  if (!ingressMode) return {};
  let domainGroup;

  if (ingressMode === 'internal') {
    domainGroup = 'srv';
  } else if (ingressMode === 'cluster-local') {
    domainGroup = 'cluster-local';
    subDomain += `.${provider.location}.${provider.cluster_name}.${provider.namespace}`;
  } else if (ingressMode === 'iap') {
    domainGroup = 'iap';
  } else {
    domainGroup = 'api';
  }

  const twDomain = createTWDomain({ twDomain: domain, domainGroup });
  let ingressType = args.ingressType;
  if (!ingressType) {
    ingressType = ingressMode === 'internal' ? 'service' : 'load-balancer';
  }

  if (ingressType === 'load-balancer') {
    const fullName = `${name.startsWith(serviceId) ? '' : serviceId + '-'}${name}`;
    const loadBalancerRes = createLoadBalancerForK8s({
      name: fullName,
      mode: ingressMode,
      loadBalancingScheme: loadBalancerConfig.loadBalancingScheme,
      twDomain,
      logSampleRate: loadBalancerConfig.logSampleRate,
      whiteList: loadBalancerConfig.whiteList,
      ipv6: loadBalancerConfig.ipv6,
      securityPolicy: loadBalancerConfig.securityPolicy,
      useTcpProbe,
    });

    deployment.endpoints[ingressMode] = {
      type: ingressMode,
      url: dnsUrl(loadBalancerRes.dnsRecord, ingressMode !== 'internal') as any,
    };

    return { autoNegConfigEntry: loadBalancerRes.autoNegConfigEntry };
  }

  const fullName = `${name}-${ingressMode}`;

  if (ingressType === 'service') {
    const type = ingressMode === 'cluster-local' ? 'ClusterIP' : 'LoadBalancer';
    const { k8sService } = createK8sService({
      name: fullName,
      type,
      ingressMode,
      annotations: {
        [HOST]: twDomain.fqdn,
      },
      selector,
      provider,
    });
    deployment.endpoints[ingressMode] = {
      type: ingressMode,
      url: getBaseUrl(k8sService) as any,
    };

    addDnsRecord({
      name: twDomain.fullSubDomain,
      domainName: twDomain.domain,
      type: 'A',
      value:
        type === 'LoadBalancer'
          ? k8sService.status.loadBalancer.ingress[0].ip
          : k8sService.spec.clusterIP,
    });
    return { k8sService };
  }

  if (ingressType === 'ingress') {
    let { k8sIngress } = createK8sIngress({
      provider,
      name: fullName,
      twDomain,
      ingressMode,
      selector,
    });
    deployment.endpoints[ingressMode] = {
      type: ingressMode,
      url: getBaseUrl(k8sIngress) as any,
    };
    return { k8sIngress };
  }
}
