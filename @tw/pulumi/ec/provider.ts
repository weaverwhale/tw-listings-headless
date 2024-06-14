import * as ec from '@pulumi/ec';
import { getSecretValue } from '../secrets';

let ecProvider;

export function getECProvider() {
  if (!ecProvider) {
    ecProvider = new ec.Provider('ec', {
      apikey: getSecretValue('ec-api-key'),
    });
  }
  return ecProvider;
}
