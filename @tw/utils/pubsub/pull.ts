import { Message, SubscriptionOptions } from '@tw/pubsub';
import { projectId as proj, isLocal } from '@tw/constants';
import { logger } from '../logger';
import { getPubSubClient } from './client';

export function pullPubSubMessages(
  subscriptionName: string,
  handler: (message: Message) => any,
  additionalOptions?: {
    forceCloud?: boolean;
    subscriptionOptions?: SubscriptionOptions;
    newClient?: boolean;
    projectId?: string;
  }
) {
  const {
    forceCloud,
    subscriptionOptions = {},
    projectId = proj,
    newClient,
  } = additionalOptions || {};

  if (!subscriptionName.startsWith('projects/')) {
    subscriptionName = `projects/${projectId}/subscriptions/${subscriptionName}`;
  }

  if (isLocal) {
    subscriptionOptions.flowControl = {
      maxMessages: 1,
    };
  }

  const pubSubClient = getPubSubClient({ forceCloud, projectId, new: newClient });
  const subscription = pubSubClient.subscription(subscriptionName, subscriptionOptions);

  subscription.on('message', handler);

  subscription.on('error', (e) => {
    logger.error('failed pull', e);
  });

  return subscription;
}
