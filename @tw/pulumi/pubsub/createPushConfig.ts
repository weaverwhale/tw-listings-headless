import { getAudience, getFullUrl } from '../utils/getBaseUrl';
import { serviceTarget } from '../types';
import { getServiceAccountForService } from '../utils/getServiceAccount';
import { monitoringState } from '../monitoring/state';

export function createPushConfig(endpoint: string, service: serviceTarget) {
  monitoringState.pubsubPush.enabled = true;
  const query = new URL(endpoint, 'http://localhost');

  if (!query.searchParams.get('isPubsub')) {
    query.searchParams.set('isPubsub', 'true');
    endpoint = query.pathname.replace('/', '') + query.search;
  }

  return {
    pushEndpoint: getFullUrl(service, endpoint),
    oidcToken: {
      audience: getAudience(service),
      serviceAccountEmail: getServiceAccountForService(),
    },
  };
}
