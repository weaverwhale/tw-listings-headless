import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getPubsubTopicId } from '../utils';

export function createDeadLetterPolicy(args?: {
  maxDeliveryAttempts?: number;
  deadLetterTopic?: pulumi.Input<string>;
}): gcp.types.input.pubsub.SubscriptionDeadLetterPolicy {
  const { maxDeliveryAttempts = 5, deadLetterTopic = 'message-graveyard' } = args || {};
  return {
    maxDeliveryAttempts,
    deadLetterTopic: getPubsubTopicId(deadLetterTopic),
  };
}
