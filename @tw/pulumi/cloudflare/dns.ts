import * as pulumi from '@pulumi/pulumi';
import * as cloudflare from '@pulumi/cloudflare';
import { getCloudFlareZone } from './constants';
import { getCloudFlareProvider } from './provider';

export function addDnsRecord(args: {
  name: string;
  domainName: string;
  value?: pulumi.Input<string>;
  type: 'A' | 'AAAA' | 'CNAME';
  ttl?: number;
  proxied?: boolean;
}): cloudflare.Record {
  const { domainName, value, type, ttl, proxied = false } = args || {};
  let name = args.name;
  if (name === '') {
    name = '@';
  }
  const record = new cloudflare.Record(
    `${name}.${domainName}-${type}`,
    {
      zoneId: getCloudFlareZone(domainName),
      name,
      value,
      type,
      ttl: ttl ?? (proxied ? 1 : 300),
      proxied,
    },
    {
      provider: getCloudFlareProvider(),
      deleteBeforeReplace: true,
      aliases: [{ name: `${name}.${domainName}` }],
    }
  );
  return record;
}

export const dnsUrl = (record: cloudflare.Record, secure?: boolean) =>
  pulumi.interpolate`http${secure ? 's' : ''}://${record.hostname}`;
