import { getConfigs } from '../utils';
import { createAlert } from './alerts';

export function createRedisAlert(args: { instanceName: string }) {
  const { serviceId, projectId, location } = getConfigs();
  const conditions = [
    {
      displayName: `Cloud Memorystore Redis Instance - Memory Usage Ratio ${serviceId}`,
      conditionThreshold: {
        filter: `resource.type = "redis_instance" AND resource.labels.instance_id = "projects/${projectId}/locations/${location}/instances/${args.instanceName}" AND metric.type = "redis.googleapis.com/stats/memory/usage_ratio"`,
        aggregations: [
          {
            alignmentPeriod: '300s',
            crossSeriesReducer: 'REDUCE_NONE',
            perSeriesAligner: 'ALIGN_MEAN',
          },
        ],
        comparison: 'COMPARISON_GT',
        duration: '0s',
        trigger: {
          count: 1,
        },
        thresholdValue: 0.75,
      },
    },
  ];
  const alert = createAlert({
    name: `redis-${args.instanceName}`,
    slack: true,
    conditions,
    displayName: `Redis ${args.instanceName} memory`,
  });
  return alert;
}
