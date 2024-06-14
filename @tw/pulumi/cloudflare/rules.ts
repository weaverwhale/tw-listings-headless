import * as cloudflare from '@pulumi/cloudflare';
import { getCloudFlareZone } from './constants';
import { getCloudFlareProvider } from './provider';

export function createCloudflarePageRule(args: {
  name: string;
  domainName: string;
  actions: cloudflare.types.input.PageRuleActions;
}) {
  const { name, domainName, actions } = args;
  const target = `${name ? name + '.' : ''}${domainName}/*`;
  new cloudflare.PageRule(
    target,
    {
      target,
      actions,
      zoneId: getCloudFlareZone(domainName),
    },
    { provider: getCloudFlareProvider() }
  );
}
