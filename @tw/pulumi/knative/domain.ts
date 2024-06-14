import * as pulumi from '@pulumi/pulumi';
import { addDnsRecord } from '../cloudflare';
import dns from 'dns';
import { promisify } from 'node:util';
import { IngressMode, K8sProvider } from '../k8s';
import { TWDomain } from '../utils';
import { isStaging } from '../constants';

export function createKnativeDomainMapping(args: {
  twDomain: TWDomain;
  mode: IngressMode;
  provider: K8sProvider;
}) {
  const { twDomain, provider } = args;

  const dnsRecord = addDnsRecord({
    name: twDomain.fullSubDomain,
    domainName: twDomain.domain,
    type: 'A',
    value: pulumi
      .output(
        promisify(dns.lookup)(
          `${isStaging ? 'stg.' : ''}kourier-${provider.cluster_name}-${
            provider.location
          }.internal.whale3.io`
        )
      )
      .apply((a) => a.address),
    proxied: false,
    ttl: 300,
  });
  return { dnsRecord };
}
