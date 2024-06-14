import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils/getConfigs';
import { getTileForMetric } from './utils';

const pos = { xPos: 0, yPos: 0 };

export const defaultDashboardTiles: { resourceType?: string; metricType: string; name: string }[] =
  [
    {
      resourceType: 'pubsub_subscription',
      metricType: 'pubsub.googleapis.com/subscription/num_unacked_messages_by_region',
      name: 'Pubsub unacked',
    },
    {
      resourceType: 'pubsub_subscription',
      metricType: 'pubsub.googleapis.com/subscription/oldest_unacked_message_age',
      name: 'Pubsub oldest message',
    },
  ];

export function createDefaultDashboard() {
  const { serviceId } = getConfigs();

  const dashboardJson = {
    category: 'CUSTOM',
    displayName: `${serviceId} default dashboard`,
    mosaicLayout: {
      columns: 4,
      tiles: defaultDashboardTiles.map(({ resourceType, metricType, name }) => {
        return getTileForMetric({
          serviceId,
          resourceType,
          metricType,
          title: name,
          pos,
          step: 2,
          columns: 4,
        });
      }),
    },
  };
  new gcp.monitoring.Dashboard('service-default-dashboard', {
    dashboardJson: pulumi.output(dashboardJson).apply((j) => JSON.stringify(j)),
  });
}
