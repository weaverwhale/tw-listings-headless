import { RandomPassword } from '@pulumi/random';
import * as gcp from '@pulumi/gcp';
import { K8sProvider, createK8sDeployment, createK8sService } from '../k8s';
import { TWDomain, enumerateNumber } from '../utils';
import { getDevopsImage } from '../cloud-build';
import { createBackendServiceForK8s, createUrlMapForK8s } from '../k8s/createLoadBalancer';
import { ClusterInfo } from './installation';
import { toJSONOutput } from '../pulumi-utils';

export function createClickCatInstance(args: {
  name: string;
  userName: string;
  provider: K8sProvider;
  password: RandomPassword;
  clickSelector: Record<string, string>;
  shardsCount: number;
  replicasCount: number;
  clusterInfo: Partial<ClusterInfo>;
  tag?: string;
  domain: TWDomain;
}) {
  const {
    name,
    userName,
    password,
    clickSelector,
    tag,
    shardsCount,
    replicasCount,
    clusterInfo,
    domain,
  } = args;

  let provider = args.provider;

  const { backendService: catBackendService, autoNegConfigEntry: catAutoNegConfigEntry } =
    createBackendServiceForK8s({
      name: `${name}-clickcat-iap`,
      mode: 'iap',
      useTcpProbe: false,
    });

  createK8sService({
    name: `${name}-clickcat-iap`,
    autoNeg: {
      backend_services: { '80': [catAutoNegConfigEntry] },
    },
    selector: {
      'triplewhale.com/deployment': `${name}-clickcat`,
    },
    provider,
    ports: [{ port: 80, targetPort: 8080 }],
    dependsOn: provider.dependsOn,
  });

  const { backendService: clickBackendService, autoNegConfigEntry: clickAutoNegConfigEntry } =
    createBackendServiceForK8s({
      name: `${name}-clickhouse-iap`,
      mode: 'iap',
      useTcpProbe: false,
      sessionAffinity: 'CLIENT_IP',
    });

  createK8sService({
    name: `${name}-clickhouse-iap`,
    autoNeg: {
      backend_services: { '80': [clickAutoNegConfigEntry] },
    },
    selector: clickSelector,
    provider,
    ports: [{ port: 80, targetPort: 8123 }],
    dependsOn: provider.dependsOn,
  });

  const replicaRules: gcp.types.input.compute.RegionUrlMapPathMatcherPathRule[] = [];
  const replicaIps: ClusterInfo['replicas'] = [];

  for (const shard of enumerateNumber(shardsCount)) {
    for (const replica of enumerateNumber(replicasCount)) {
      const path = `instance-${shard}-${replica}`;
      const { backendService, autoNegConfigEntry } = createBackendServiceForK8s({
        name: `${name}-clickhouse-${shard}-${replica}-iap`,
        mode: 'iap',
        useTcpProbe: false,
        sessionAffinity: 'CLIENT_IP',
      });
      const domain = new TWDomain(
        'whaledb.io',
        `${name}-${shard}-${replica}.clickhouse`,
        'internal'
      );

      const { k8sService } = createK8sService({
        name: `${name}-clickhouse-${shard}-${replica}-iap`,
        autoNeg: {
          backend_services: { '8123': [autoNegConfigEntry] },
        },
        selector: {
          ...clickSelector,
          'clickhouse.altinity.com/replica': `${replica}`,
          'clickhouse.altinity.com/shard': `${shard}`,
        },
        provider,
        ingressMode: 'internal',
        twDomain: domain,
        type: 'LoadBalancer',
        ports: [
          { port: 8123, targetPort: 8123, name: 'http' },
          { port: 9000, targetPort: 9000, name: 'client' },
        ],
        dependsOn: provider.dependsOn,
      });

      replicaIps.push({
        ip: k8sService.status.loadBalancer.ingress[0].ip,
        name: path,
        domain: domain.fqdn,
      });

      replicaRules.push({
        service: backendService.id,
        routeAction: {
          urlRewrite: { pathPrefixRewrite: '/' },
        },
        paths: [`/_clickhouse/${path}`, `/_clickhouse/${path}/*`],
      });
    }
  }

  clusterInfo.replicas = replicaIps;

  createUrlMapForK8s({
    name: `${name}-clickhouse-ui`,
    backendService: catBackendService,
    mode: 'iap',
    pathRules: [
      ...replicaRules,
      {
        service: clickBackendService.id,
        routeAction: {
          urlRewrite: { pathPrefixRewrite: '/' },
        },
        paths: ['/_clickhouse', '/_clickhouse/*'],
      },
    ],
    twDomain: domain,
    dependsOn: provider.dependsOn,
  });

  createK8sDeployment({
    provider,
    name: `${name}-clickcat`,
    envs: {
      CONNECTION_USER: userName,
      CONNECTION_PASS: password.result,
      CONNECTION_URL: `https://${domain.fqdn}/_clickhouse`,
      CLUSTER_INFO: toJSONOutput(args.clusterInfo),
    },
    podArgs: {
      image: getDevopsImage('clickcat', tag),
      ports: [{ containerPort: 8080 }],
      allowSpot: false,
      CPURequest: '100m',
      memoryRequest: '128Mi',
    },
    maxReplicas: 1,
  });

  return { domain };
}
