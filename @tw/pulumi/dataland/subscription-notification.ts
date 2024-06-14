import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createStorageNotification } from '../storage';
import { createPushConfig } from '../pubsub';
import { getConfigs, getStackReference, getUniqueNameInProject } from '../utils';
import { serviceTarget } from '../types';
import { chronosIngestService, deadLetterTopicId } from './names';

export class BucketSubscriptionAndNotificationConfig {
  constructor(bucketName: string, objectNamePrefix: string) {
    this.bucketName = bucketName;
    this.objectNamePrefix = objectNamePrefix;
  }
  bucketName: string;
  objectNamePrefix: string;
}

export class SubscriptionExistingTopicConfig {
  constructor(topicName: string, labels: { providerId: string; msgType: string }) {
    this.topicName = topicName;
    this.labels = labels;
  }
  topicName: string;
  labels: { providerId: string; msgType: string };
}

export function createTopicSubscriptionNotification(
  bucketName: string,
  objectNamePrefix: string,
  endpoint: string,
  service: serviceTarget,
  deadLetterTopicId: pulumi.Input<string>
) {
  const re = /\//g;
  const name = getUniqueNameInProject(
    `dataland-${bucketName}-${objectNamePrefix.replace(re, '__')}-object-on-finalize`
  ) as string;
  const topic = new gcp.pubsub.Topic(name);

  createStorageNotification(bucketName, topic, objectNamePrefix);

  // This auto labeling is guesswork and mostly it is wrong. TODO: accept explicit labels from args
  //  const [providerId, msgType] = objectNamePrefix.split('/');
  //  const labels = {
  //    'provider-id': providerId,
  //    'msg-type': msgType,
  //  };

  let pubsubConfig = {
    topic: topic.id,
    pushConfig: createPushConfig(endpoint, service),
    deadLetterPolicy: {
      deadLetterTopic: deadLetterTopicId,
      maxDeliveryAttempts: 10,
    },
    retryPolicy: {
      minimumBackoff: '5s',
      maximumBackoff: '90s',
    },
    ackDeadlineSeconds: 90,
    //    labels,
  };
  new gcp.pubsub.Subscription(name, pubsubConfig);
}

export function createSubscriptionForIngest(
  topicName: string,
  labels: { providerId: string; msgType: string },
  endpoint: string,
  filter: string = null
) {
  const { stack, projectId } = getConfigs();

  createSubscriptionToExistingTopic(
    topicName,
    projectId,
    labels,
    endpoint,
    chronosIngestService,
    deadLetterTopicId,
    filter
  );
}

export function createSubscriptionToExistingTopic(
  topicName: string,
  projectId: string,
  labels: { providerId: string; msgType: string },
  endpoint: string,
  service: serviceTarget,
  deadLetterTopicId: pulumi.Input<string>,
  filter: string = null
) {
  const topic = gcp.pubsub.Topic.get(topicName, `projects/${projectId}/topics/${topicName}`);

  let pubsubConfig = {
    topic: topic.id,
    pushConfig: createPushConfig(endpoint, service),
    deadLetterPolicy: {
      deadLetterTopic: deadLetterTopicId,
      maxDeliveryAttempts: 10,
    },
    ackDeadlineSeconds: 30,
    retryPolicy: {
      minimumBackoff: '5s',
      maximumBackoff: '90s',
    },
    labels: {
      'provider-id': labels.providerId,
      'msg-type': labels.msgType,
    },
    filter: filter,
  };
  new gcp.pubsub.Subscription(`dataland-${topicName}`, pubsubConfig);
}
