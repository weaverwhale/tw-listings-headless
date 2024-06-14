import * as cloudflare from '@pulumi/cloudflare';
import { getSecretValue } from '../secrets';

let cloudFlareProvider;

export function getCloudFlareProvider() {
  if (!cloudFlareProvider) {
    cloudFlareProvider = new cloudflare.Provider('cloudflare', {
      apiToken: getSecretValue('cloudflare-token-pulumi'),
    });
  }
  return cloudFlareProvider;
}
