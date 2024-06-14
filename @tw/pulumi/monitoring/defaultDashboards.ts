import { getConfigs } from '../utils';
import { getTileForMetric } from './utils';
import * as gcp from '@pulumi/gcp';
import { defaultMetrics } from './metrics';
import { toJSONOutput } from '../pulumi-utils';

const pos = { xPos: 0, yPos: 0 };

export function createDefaultServiceDashboards(args?: {}) {
  const { serviceId } = getConfigs();

  const metrics = [
    ...defaultMetrics.cloud_run_revision(serviceId),
    ...defaultMetrics.pubsub_subscription(serviceId),
  ];

  const dashboardJson = {
    displayName: `${serviceId} default dashboard`,
    labels: { services: 'services' },
    mosaicLayout: {
      columns: 4,
      tiles: metrics.map(({ resourceType, metricType, name, filter, aggregation }) => {
        return getTileForMetric({
          resourceType,
          metricType,
          title: name,
          pos,
          step: 2,
          columns: 4,
          filter,
          aggregation,
        });
      }),
    },
  };

  new gcp.monitoring.Dashboard('service-default-dashboard', {
    dashboardJson: toJSONOutput(dashboardJson),
  });
}
