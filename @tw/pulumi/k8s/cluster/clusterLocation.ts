import * as gcp from '@pulumi/gcp';

export function createClusterRegion(args: {
  region: string;
  network: string;
  subnetIpCidrRange: string;
}) {
  const { region, network, subnetIpCidrRange } = args;
  const chip = region === 'europe-west1' ? 'eu' : '';
  const subnetwork = new gcp.compute.Subnetwork(
    `sub-dual-${region}`,
    {
      name: `${network}-dual`,
      role: 'ACTIVE',
      ipCidrRange: subnetIpCidrRange,
      network,
      stackType: 'IPV4_IPV6',
      ipv6AccessType: 'EXTERNAL',
      region,
    },
    { aliases: [{ name: `sub-dual${chip}` }] }
  );

  const router = new gcp.compute.Router(
    `router-${region}`,
    {
      name: 'k8s-router',
      region,
      network,
    },
    { aliases: [{ name: `router${chip}` }] }
  );

  new gcp.compute.RouterNat(
    `router-nat-${region}`,
    {
      name: 'k8s-nat',
      router: router.name,
      region: router.region,
      natIpAllocateOption: 'AUTO_ONLY',
      sourceSubnetworkIpRangesToNat: 'ALL_SUBNETWORKS_ALL_IP_RANGES',
      minPortsPerVm: 16384,
      maxPortsPerVm: 65536,
      enableEndpointIndependentMapping: false,
      enableDynamicPortAllocation: true,
      type: 'PUBLIC',
      logConfig: {
        enable: true,
        filter: 'ERRORS_ONLY',
      },
    },
    { aliases: [{ name: `nat${chip}` }], ignoreChanges: ['type'] }
  );
  return { subnetwork, router };
}
