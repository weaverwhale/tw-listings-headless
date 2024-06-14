import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createAlert } from '../monitoring';
import { getConfigs } from '../utils';

export function createDefaultPubsubAlerts(excludePubsubSubs: gcp.pubsub.Subscription[]) {
  const { serviceId } = getConfigs();
  let filter: any = `resource.type = "pubsub_subscription" AND metric.type = "pubsub.googleapis.com/subscription/oldest_unacked_message_age" AND metadata.user_labels.service-id = "${serviceId}"`;
  if (excludePubsubSubs.length) {
    filter = pulumi.interpolate`${filter} AND ${pulumi
      .all(excludePubsubSubs.map((v) => v.name))
      .apply((subIds) => subIds.map((v) => `resource.labels.subscription_id != "${v}"`))}`;
  }
  createAlert({
    name: 'default-pubsub-alert',
    displayName: `Pubsub ${serviceId} oldest unacked`,
    slack: true,
    conditions: [
      {
        displayName: 'Cloud Pub/Sub Subscription - Oldest unacked message age',
        conditionThreshold: {
          aggregations: [
            {
              alignmentPeriod: '300s',
              perSeriesAligner: 'ALIGN_MEAN',
            },
          ],
          comparison: 'COMPARISON_GT',
          duration: '0s',
          filter,
          thresholdValue: 3600,
          trigger: {
            count: 1,
          },
        },
      },
    ],
  });
}
