import * as gcp from '@pulumi/gcp';
import { addDnsRecord } from '../cloudflare';
import { TWDomain, getConfigs, setOutput } from '../utils';
import { AutoNegConfigEntry } from './service';
import { IngressMode } from './types';
import { getIapInfo } from './iap';
import {
  BackendService,
  BackendServiceArgs,
  RegionBackendService,
  RegionBackendServiceArgs,
} from '@pulumi/gcp/compute';
import { DependsOn } from '../pulumi-utils';
import { AffinityType } from './gke';

export type LoadBalancingScheme = 'EXTERNAL' | 'INTERNAL' | 'EXTERNAL_MANAGED' | 'INTERNAL_MANAGED';

type LoadBalancerType = 'application' | 'pass-through';

function getLBDefaults(args: {
  loadBalancingScheme: LoadBalancingScheme;
  mode: IngressMode;
  type: LoadBalancerType;
  port?: number;
}) {
  let { loadBalancingScheme, mode, type, port } = args;
  loadBalancingScheme =
    loadBalancingScheme ||
    (['open', 'iap'].includes(mode) ? 'EXTERNAL_MANAGED' : 'INTERNAL_MANAGED');
  const isInternal = loadBalancingScheme.startsWith('INTERNAL');

  if (type === 'pass-through') {
    loadBalancingScheme = loadBalancingScheme.replace('_MANAGED', '') as LoadBalancingScheme;
  }

  const isApplication = loadBalancingScheme.endsWith('MANAGED') || !isInternal;

  port = port || (isInternal ? 80 : 443);

  return { isInternal, isApplication, loadBalancingScheme, port };
}

export function createBackendServiceForK8s(args: {
  name: string;
  loadBalancingScheme?: LoadBalancingScheme;
  mode?: IngressMode;
  timeoutSec?: number;
  logSampleRate?: number;
  useTcpProbe?: boolean;
  sessionAffinity?: AffinityType;
  securityPolicy?: gcp.compute.SecurityPolicy;
}) {
  const {
    name,
    mode,
    loadBalancingScheme,
    timeoutSec = 3600,
    logSampleRate = 0.3,
    useTcpProbe = true,
    sessionAffinity,
    securityPolicy,
  } = args;
  const { location } = getConfigs();
  const { isApplication, isInternal } = getLBDefaults({
    loadBalancingScheme,
    mode,
    type: 'application',
  });

  const healthCheck = new gcp.compute.HealthCheck(name, {
    ...(useTcpProbe
      ? {
          tcpHealthCheck: {
            portSpecification: 'USE_SERVING_PORT',
          },
        }
      : {
          httpHealthCheck: {
            portSpecification: 'USE_SERVING_PORT',
            requestPath: '/ping',
          },
        }),
    healthyThreshold: 1,
    checkIntervalSec: 1,
    logConfig: {
      enable: true,
    },
    timeoutSec: 1,
  });
  let iap;

  if (mode === 'iap') {
    const { clientId, clientSecret } = getIapInfo();
    iap = { oauth2ClientId: clientId, oauth2ClientSecret: clientSecret };
  }

  const backendArgs: RegionBackendServiceArgs & BackendServiceArgs = {
    securityPolicy: securityPolicy?.selfLink,
    healthChecks: healthCheck.selfLink,
    loadBalancingScheme,
    timeoutSec,
    connectionDrainingTimeoutSec: 600,
    localityLbPolicy: 'ROUND_ROBIN',
    sessionAffinity,
    logConfig: {
      enable: logSampleRate ? true : false,
      sampleRate: logSampleRate,
    },
  };

  if (isInternal) {
    backendArgs.region = location;
  }
  if (!isApplication) {
    backendArgs.protocol = 'TCP';
    backendArgs.localityLbPolicy = null;
  }
  if (mode === 'iap') {
    backendArgs.portName = 'http';
    backendArgs.protocol = 'HTTP';
    backendArgs.localityLbPolicy = undefined;
    backendArgs.iap = iap;
  }

  const backendService = new (
    isInternal ? gcp.compute.RegionBackendService : gcp.compute.BackendService
  )(name, backendArgs, { ignoreChanges: ['backends'] });

  const autoNegConfigEntry = createAutoNegConfigEntry({ backendService, isInternal });

  return { backendService, autoNegConfigEntry };
}

export function createUrlMapForK8s(args: {
  name: string;
  mode?: IngressMode;
  ipv6?: boolean;
  twDomain: TWDomain;
  loadBalancingScheme?: LoadBalancingScheme;
  backendService: RegionBackendService | BackendService;
  whiteList?: string[];
  port?: number;
  pathRules?: gcp.types.input.compute.RegionUrlMapPathMatcherPathRule[];
  dependsOn?: DependsOn;
}) {
  const {
    name,
    mode,
    ipv6,
    twDomain,
    loadBalancingScheme,
    backendService,
    pathRules = [],
    whiteList = ['/*'],
  } = args;
  const { location } = getConfigs();
  const { isApplication, isInternal, port } = getLBDefaults({
    loadBalancingScheme,
    mode,
    type: 'application',
    port: args.port,
  });
  const urlMap = isApplication
    ? new (isInternal ? gcp.compute.RegionUrlMap : gcp.compute.URLMap)(name, {
        defaultService: backendService.id,
        hostRules: [{ hosts: ['*'], pathMatcher: 'white-list' }],
        pathMatchers: [
          {
            name: 'white-list',
            defaultUrlRedirect: {
              redirectResponseCode: 'FOUND',
              stripQuery: false,
              pathRedirect: '/404.html',
            },
            pathRules: [
              ...pathRules,
              { paths: [...whiteList, '/404.html', '/ping'], service: backendService.id },
            ],
          },
        ],
        region: location,
      })
    : null;

  const sslCertificate = !isInternal
    ? new gcp.compute.ManagedSslCertificate(`${name}-managed-ssl`, {
        managed: { domains: [twDomain.fqdn] },
      })
    : null;

  const targetHttpProxy = isApplication
    ? new (isInternal ? gcp.compute.RegionTargetHttpProxy : gcp.compute.TargetHttpsProxy)(
        `${name}-https-proxy`,
        {
          urlMap: urlMap.id,
          sslCertificates: [sslCertificate?.id],
          sslPolicy: 'ssl-1-2',
          region: location,
        }
      )
    : null;

  const httpForwarderIPV4 = new (
    isInternal ? gcp.compute.ForwardingRule : gcp.compute.GlobalForwardingRule
  )(
    `${name}-forward-http-ipv4`,
    {
      portRange: String(port),
      target: targetHttpProxy?.id,
      loadBalancingScheme,
      ...(isInternal
        ? {
            network: 'app',
            region: location,
            subnetwork: 'app-dual',
            allowGlobalAccess: true,
          }
        : {
            ipVersion: 'IPV4',
          }),
      ...(!isApplication
        ? {
            backendService: backendService.id,
            ipProtocol: 'TCP',
            ports: [String(port)],
            portRange: null,
          }
        : null),
    },
    { replaceOnChanges: ['allowGlobalAccess'] }
  );

  const httpForwarderIPV6 = ipv6
    ? new gcp.compute.GlobalForwardingRule(
        `${name}-forward-http-ipv6`,
        {
          portRange: '443',
          target: targetHttpProxy.id,
          ipVersion: 'IPV6',
          loadBalancingScheme,
        },
        { aliases: [{ name: `${name}-forward-http-ipv6`.replace(`-${mode}`, '') }] }
      )
    : null;

  const dnsRecord = addDnsRecord({
    name: twDomain.fullSubDomain,
    domainName: twDomain.domain,
    type: 'A',
    value: httpForwarderIPV4.ipAddress,
    proxied: mode === 'iap' && false,
  });

  if (ipv6) {
    addDnsRecord({
      name: twDomain.fullSubDomain,
      domainName: twDomain.domain,
      type: 'AAAA',
      value: httpForwarderIPV6.ipAddress,
      proxied: false,
    });
  }

  if (mode === 'open') {
    setOutput('openBackendService', backendService.id);
  }
  return { httpForwarderIPV4, httpForwarderIPV6, dnsRecord };
}

export function createAutoNegConfigEntry(args: {
  backendService: RegionBackendService | BackendService;
  isInternal: boolean;
}) {
  const { backendService, isInternal } = args;
  const { location } = getConfigs();
  const autoNegConfigEntry: AutoNegConfigEntry = {
    name: backendService.name,
    max_rate_per_endpoint: 100,
  };

  if (isInternal) {
    autoNegConfigEntry.region = location;
  }
  return autoNegConfigEntry;
}

export function createLoadBalancerForK8s(args: {
  name: string;
  mode?: IngressMode;
  ipv6?: boolean;
  twDomain: TWDomain;
  loadBalancingScheme?: LoadBalancingScheme;
  // note: standalone negs do not support pass through lbs: https://cloud.google.com/kubernetes-engine/docs/how-to/standalone-neg
  // so this should not be used for now
  type?: LoadBalancerType;
  timeoutSec?: number;
  logSampleRate?: number;
  whiteList?: string[];
  useTcpProbe?: boolean;
  port?: number;
  securityPolicy?: gcp.compute.SecurityPolicy;
}) {
  const {
    name,
    mode,
    ipv6,
    twDomain,
    type = 'application',
    timeoutSec = 3600,
    logSampleRate = 0.3,
    whiteList = ['/*'],
    useTcpProbe = true,
    securityPolicy,
  } = args;

  const { loadBalancingScheme } = getLBDefaults({
    loadBalancingScheme: args.loadBalancingScheme,
    mode,
    type,
  });
  const fullName = `${name}-${mode}`;

  const { backendService, autoNegConfigEntry } = createBackendServiceForK8s({
    name: fullName,
    loadBalancingScheme,
    timeoutSec,
    mode,
    logSampleRate,
    useTcpProbe,
    securityPolicy,
  });

  const { httpForwarderIPV4, httpForwarderIPV6, dnsRecord } = createUrlMapForK8s({
    name: fullName,
    mode,
    ipv6,
    twDomain,
    loadBalancingScheme,
    backendService,
    whiteList,
  });

  return { httpForwarderIPV4, httpForwarderIPV6, backendService, dnsRecord, autoNegConfigEntry };
}
