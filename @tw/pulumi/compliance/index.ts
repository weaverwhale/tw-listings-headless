import { compliance } from '@tw/constants';
import type { serviceTarget } from '../types';
import { createSubscription } from '../pubsub';
import { getConfigs, getStackReference } from '../utils';

const { serviceId } = getConfigs();
export function createDataDeletionSubscription({
  endpoint,
  service,
}: {
  endpoint?: string;
  service: serviceTarget;
}) {
  return createSubscription({
    name: `data-deletion-request-sub-${serviceId}`,
    topicName: compliance.DELETE_DATA_REQUEST_TOPIC,
    endpoint: endpoint || '/delete-data-request',
    service,
  });
}
