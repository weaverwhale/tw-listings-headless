import * as cloudflare from '@pulumi/cloudflare';
import { getCloudFlareZone } from './constants';
import { getCloudFlareProvider } from './provider';

export function createCloudFlareWorkerRoute(args: {
  scriptName: string;
  domain: string;
  path: string;
}) {
  const { scriptName, domain, path } = args || {};
  const workerRoute = new cloudflare.WorkerRoute(
    scriptName,
    {
      zoneId: getCloudFlareZone(domain.split('.').splice(-2).join('.')),
      pattern: `${domain}${path}`,
      scriptName: scriptName,
    },
    { provider: getCloudFlareProvider(), deleteBeforeReplace: true }
  );
  return workerRoute;
}
