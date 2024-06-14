import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createPushConfig } from './createPushConfig';
import type { SubscriptionArgs } from '@pulumi/gcp/pubsub';
import type { CustomResourceOptions } from '@pulumi/pulumi';
import type { serviceTarget } from '../types';
import { getConfigs } from '../utils';
import { createDeadLetterPolicy } from './deadLetter';
import { monitoringState } from '../monitoring/state';

export function createSubscription(args: {
  name: string;
  topicName: pulumi.Input<string>;
  endpoint?: string;
  service?: serviceTarget;
  addDeadLetterPolicy?: boolean;
  filter?: pulumi.Input<string>;
  retryPolicy?: pulumi.Input<gcp.types.input.pubsub.SubscriptionRetryPolicy>;
  overrides?: Partial<SubscriptionArgs>;
}) {
  const {
    name,
    topicName,
    endpoint,
    service,
    addDeadLetterPolicy,
    filter,
    retryPolicy = {
      minimumBackoff: '5s',
      maximumBackoff: '90s',
    },
    overrides,
  } = args;
  const { projectId } = getConfigs();
  if (!(service && endpoint)) {
    monitoringState.pubsubPull.enabled = true;
  }
  const opts: gcp.pubsub.SubscriptionArgs = {
    name,
    topic: topicName,
    ...(service && endpoint
      ? {
          pushConfig: createPushConfig(endpoint, service),
        }
      : {}),
    ackDeadlineSeconds: 30,
    retryPolicy,
    enableMessageOrdering: true,
    retainAckedMessages: true,
    messageRetentionDuration: '172800s', // 2 days
    filter,
    deadLetterPolicy: addDeadLetterPolicy ? createDeadLetterPolicy() : undefined,
    ...overrides,
  };
  return new gcp.pubsub.Subscription(name, opts, {
    aliases: [{ name: `${name}-${projectId}` }],
    deleteBeforeReplace: Boolean(opts.name),
  });
}
