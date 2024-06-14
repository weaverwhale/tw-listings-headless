import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';

export function localPullSub(args: {
  serviceId?: string;
  topicName?: pulumi.Output<string> | string;
  subscriptionName?: string;
  projectIds?: string[];
}) {
  const { projectId } = getConfigs();
  const { serviceId, subscriptionName } = args;
  const projectIds = args.projectIds || ['triple-whale-staging'];
  const topicName = args.topicName || 'local-webhooks-topic';
  if (projectIds?.length > 0 && !projectIds.includes(projectId)) return;

  const subOptions: gcp.pubsub.SubscriptionArgs = {
    name: subscriptionName,
    topic: topicName,
    messageRetentionDuration: '600s',
  };
  if (serviceId) {
    subOptions.filter = `attributes.serviceId="${serviceId}"`;
  }

  return new gcp.pubsub.Subscription(`${subscriptionName}-sub`, subOptions);
}
