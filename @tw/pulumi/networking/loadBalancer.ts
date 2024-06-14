import * as gcp from '@pulumi/gcp';
import { getConfigs } from '../utils/getConfigs';

type CloudRunConf = {
  name: string;
  paths: string[];
  routeAction?: gcp.types.input.compute.URLMapPathMatcherPathRuleRouteAction;
};

type BucketConf = {
  name: string;
  paths: string[];
  routeAction?: gcp.types.input.compute.URLMapPathMatcherPathRuleRouteAction;
  enableCdn?: boolean;
  cdnPolicy?: gcp.types.input.compute.BackendBucketCdnPolicy;
  compressionMode?: 'AUTOMATIC' | 'DISABLED';
};
export function createLoadBalancer(args?: {
  name: string;
  domains: string[];
  cloudRuns?: CloudRunConf[];
  buckets?: BucketConf[];
  defaultService: string;
  headerAction?: gcp.types.input.compute.URLMapPathMatcherHeaderAction;
  ipv6?: boolean;
  classic?: boolean;
}) {
  const { location, serviceId } = getConfigs();
  const {
    domains,
    name,
    cloudRuns = [],
    buckets = [],
    defaultService,
    ipv6,
    classic = true,
    headerAction,
  } = args || {};

  const loadBalancingScheme = classic ? 'EXTERNAL' : 'EXTERNAL_MANAGED';
  const pathRules: gcp.types.input.compute.URLMapPathMatcherPathRule[] = [];
  const backends = {};

  const sslCertificate = new gcp.compute.ManagedSslCertificate(`managed-ssl-${name}`, {
    managed: { domains: domains },
  });

  for (const cloudRun of cloudRuns) {
    const endpointGroup = new gcp.compute.RegionNetworkEndpointGroup(
      `${cloudRun.name}-endpoint-group`,
      {
        name: `${cloudRun.name}-${name}`,
        networkEndpointType: 'SERVERLESS',
        region: location,
        cloudRun: { service: cloudRun.name },
      }
    );

    const backendService = new gcp.compute.BackendService(`${cloudRun.name}-backend-service`, {
      name: `${cloudRun.name}-${name}`,
      backends: [{ group: endpointGroup.id }],
      loadBalancingScheme,
    });
    backends[cloudRun.name] = backendService;
    pathRules.push({
      paths: cloudRun.paths,
      service: backendService.id,
      routeAction: cloudRun.routeAction,
    });
  }

  for (const bucket of buckets) {
    const backendBucket = new gcp.compute.BackendBucket(`${bucket.name}-backend-service`, {
      name: `${serviceId}-${bucket.name}-bucket`,
      bucketName: bucket.name,
      enableCdn: bucket.enableCdn,
      cdnPolicy: bucket.cdnPolicy,
      compressionMode: bucket.compressionMode,
    });
    backends[bucket.name] = backendBucket;
    pathRules.push({
      paths: bucket.paths,
      service: backendBucket.id,
      routeAction: bucket.routeAction,
    });
  }

  const urlMap = new gcp.compute.URLMap(`${name}-url-map`, {
    name: `${name}-load-balancer`,
    defaultService: backends[defaultService].id,
    hostRules: [
      {
        hosts: domains,
        pathMatcher: 'paths',
      },
    ],
    pathMatchers: [
      {
        name: 'paths',
        defaultService: backends[defaultService].id,
        pathRules,
        headerAction,
      },
    ],
  });

  const targetHttpsProxy = new gcp.compute.TargetHttpsProxy(`${name}-https-proxy`, {
    urlMap: urlMap.id,
    sslCertificates: [sslCertificate.id],
    sslPolicy: 'ssl-1-2',
  });

  const httpForwarderIPV4 = new gcp.compute.GlobalForwardingRule(`${name}-forward-http-ipv4`, {
    portRange: '443',
    target: targetHttpsProxy.id,
    ipVersion: 'IPV4',
    loadBalancingScheme,
  });

  const httpForwarderIPV6 = ipv6
    ? new gcp.compute.GlobalForwardingRule(`${name}-forward-http-ipv6`, {
        portRange: '443',
        target: targetHttpsProxy.id,
        ipVersion: 'IPV6',
        loadBalancingScheme,
      })
    : null;

  return { httpForwarderIPV4, httpForwarderIPV6 };
}
