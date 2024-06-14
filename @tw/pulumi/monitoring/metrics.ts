import { cloudRunAggregation, cloudRunFilter, labelFilter } from './utils';

export const defaultMetrics: Record<
  string,
  (args: any) => {
    metricType: string;
    resourceType: string;
    name: string;
    filter: string;
    aggregation?: any;
  }[]
> = {
  cloud_run_revision: (serviceId) => {
    return [
      {
        metricType: 'run.googleapis.com/request_count',
        resourceType: 'cloud_run_revision',
        name: 'Cloud Run - Request Count',
        filter: cloudRunFilter(serviceId),
        aggregation: cloudRunAggregation(),
      },
      {
        metricType: 'run.googleapis.com/request_latencies',
        resourceType: 'cloud_run_revision',
        name: 'Cloud Run - Request Latency',
        filter: cloudRunFilter(serviceId),
        aggregation: cloudRunAggregation(),
      },
      {
        metricType: 'run.googleapis.com/container/cpu/utilizations',
        resourceType: 'cloud_run_revision',
        name: 'Cloud Run - Container CPU Utilization',
        filter: cloudRunFilter(serviceId),
        aggregation: cloudRunAggregation(),
      },
      {
        metricType: 'run.googleapis.com/container/memory/utilizations',
        resourceType: 'cloud_run_revision',
        name: 'Cloud Run - Container Memory Utilization',
        filter: cloudRunFilter(serviceId),
        aggregation: cloudRunAggregation(),
      },
      {
        metricType: 'run.googleapis.com/container/instance_count',
        resourceType: 'cloud_run_revision',
        name: 'Cloud Run - Instance Count',
        filter: cloudRunFilter(serviceId),
        aggregation: {
          alignmentPeriod: '60s',
          crossSeriesReducer: 'REDUCE_MEAN',
          perSeriesAligner: 'ALIGN_SUM',
        },
      },
    ];
  },

  pubsub_subscription: (serviceId) => {
    return [
      {
        resourceType: 'pubsub_subscription',
        metricType: 'pubsub.googleapis.com/subscription/num_unacked_messages_by_region',
        name: 'Pubsub Subscription - unacked messages',
        filter: labelFilter(serviceId),
      },
      {
        resourceType: 'pubsub_subscription',
        metricType: 'pubsub.googleapis.com/subscription/oldest_unacked_message_age',
        name: 'Pubsub Subscription - oldest message age',
        filter: labelFilter(serviceId),
      },
    ];
  },
};
