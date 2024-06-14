import * as kubernetes from '@pulumi/kubernetes';
import { iapClientId } from '@tw/constants';
import { getSecretValue } from '../secrets';
import { K8sProvider, getK8sProvider } from './provider';
import { k8sUniqueName } from './utils';

const iapConfigs = {};

export function createIapConfig(args?: { provider?: K8sProvider }) {
  const { provider = getK8sProvider() } = args || {};
  const key = `iap-${provider.uuid}`;
  if (iapConfigs[key]) return iapConfigs[key];
  const { clientId, clientSecret } = getIapInfo();
  const iapConfig = new kubernetes.core.v1.Secret(
    key,
    {
      metadata: {
        name: 'iap-config',
      },
      stringData: {
        client_id: clientId,
        client_secret: clientSecret,
      },
    },
    { provider }
  );
  iapConfigs[key] = iapConfig;
  return iapConfig;
}

export function getIapInfo() {
  return {
    clientId: iapClientId,
    clientSecret: getSecretValue('iap-client-secret'),
  };
}
