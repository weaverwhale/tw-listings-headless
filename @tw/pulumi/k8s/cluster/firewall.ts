import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { K8sCluster } from './cluster';

export function openFirewallPortsOnCluster(args: { cluster: K8sCluster }) {
  const { cluster } = args;
  createClusterFirewallRule({
    name: `cluster-ports-${cluster.cluster_uuid}`,
    cluster,
    sourceRanges: [
      // lb health check https://cloud.google.com/load-balancing/docs/health-check-concepts#ip-ranges
      '35.191.0.0/16',
      '130.211.0.0/22',
      // iap https://cloud.google.com/iap/docs/using-tcp-forwarding
      '35.235.240.0/20',
    ],
  });
}

export function createClusterFirewallRule(args: {
  cluster: K8sCluster;
  ports?: string[];
  name: string;
  sourceRanges: pulumi.Input<string>[];
}) {
  const { cluster, ports = [], name, sourceRanges } = args;
  const clusterId = cluster.ipAllocationPolicy.clusterSecondaryRangeName.apply((v) =>
    v.split('-').pop()
  );
  const opts: gcp.compute.FirewallArgs = {
    allows: [
      {
        ports: ports,
        protocol: ports.length ? 'tcp' : 'all',
      },
    ],
    sourceRanges,
    targetTags: [pulumi.interpolate`gke-${cluster.name}-${clusterId}-node`],
    direction: 'INGRESS',
    network: 'app',
    priority: 1000,
  };
  new gcp.compute.Firewall(name, opts);
}
