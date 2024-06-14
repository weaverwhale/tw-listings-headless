import { Topic } from '@tw/pubsub';
import { GoogleError } from 'google-gax';
import { logger } from '../logger';
import { getPubSubClient } from './client';
import { getStoreKey } from '../twContext';
import { healthChecks } from '../express';

// NOTE: pubsub will wait until at least one of the conditions is true:
export const batching = {
  maxBytes: 1024 * 1024, // 1MB
  maxMessages: 1000,
  maxMilliseconds: 100,
};

const batchingTopics: Record<string, Topic> = {};
const topics: Record<string, Topic> = {};

/**
 * Calls the Pub/Sub service to publish a message to a topic.
 *
 * @param topicName - The name of the topic to publish the message to.
 * @param payload - The payload of the message.
 * @param attributes - Additional attributes to attach to the message.
 * @param additionalOptions - Additional options for publishing the message.
 * @returns A Promise that resolves to the message ID of the published message.
 * @throws If there is an error while publishing the message.
 */
export async function callPubSub<T = any>(
  topicName: string,
  payload: T,
  attributes: Record<string, string> = {},
  additionalOptions?: {
    batching?: {
      maxBytes?: number;
      maxMessages?: number;
      maxMilliseconds?: number;
    };
    forceCloud?: boolean;
    log?: boolean;
    topic?: Topic;
  }
): Promise<string> {
  const { batching, forceCloud, log = false } = additionalOptions || {};
  const pubSubClient = getPubSubClient({ forceCloud });
  const context = getStoreKey('context');
  if (context?.traceId) attributes.traceId = context.traceId;

  let topic: Topic;

  if (additionalOptions?.topic) {
    topic = additionalOptions.topic;
  } else if (batching) {
    // https://cloud.google.com/pubsub/quotas#resource_limits
    const maxBytes = 1024 * 1024 * 10;
    const maxMessages = 1000;
    batching.maxBytes = Math.min(batching.maxBytes || maxBytes, maxBytes);
    batching.maxMessages = Math.min(batching.maxMessages || maxMessages, maxMessages);
    if (!batchingTopics[topicName]) {
      batchingTopics[topicName] = pubSubClient.topic(topicName, { batching });
    }
    topic = batchingTopics[topicName];
  } else {
    if (!topics[topicName]) {
      topics[topicName] = pubSubClient.topic(topicName);
    }
    topic = topics[topicName];
  }
  try {
    const dataBuffer = Buffer.from(JSON.stringify(payload));
    const messageId = await topic.publishMessage({ data: dataBuffer, attributes });
    if (log) logger.info(`published message: ${messageId}`);
    return messageId;
  } catch (e) {
    // Error: Total timeout of API google.pubsub.v1.Publisher exceeded 60000 milliseconds before any response was received.
    // recreate client
    if (e instanceof GoogleError) {
      logger.info(`callPubSub recreating client`);
      healthChecks.push(async () => false);
      getPubSubClient({ new: true });
    }
    logger.error(`callPubSub ${topicName}, ${e}`);
    throw e;
  }
}
