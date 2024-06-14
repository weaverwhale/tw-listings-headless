import { createAlert } from '../monitoring/alerts';

export function createCloudRunAlert(args: { serviceName: string }) {
  const { serviceName } = args;

  const conditions = [
    {
      displayName: `Cloud Run Requests 5xx, 4xx ${serviceName}`,
      conditionThreshold: {
        aggregations: [
          {
            alignmentPeriod: '3600s',
            crossSeriesReducer: 'REDUCE_SUM',
            groupByFields: ['metric.label.response_code_class'],
            perSeriesAligner: 'ALIGN_SUM',
          },
          {
            alignmentPeriod: '3600s',
            perSeriesAligner: 'ALIGN_PERCENT_CHANGE',
          },
        ],
        comparison: 'COMPARISON_GT',
        duration: '3600s',
        filter: `resource.type = "cloud_run_revision" AND resource.labels.service_name = "${serviceName}" AND metric.type = "run.googleapis.com/request_count" AND metric.labels.response_code_class = one_of("4xx", "5xx")`,
        thresholdValue: 30000,
        trigger: {
          count: 1,
        },
      },
    },
  ];

  const alert = createAlert({
    name: serviceName,
    slack: true,
    conditions,
    displayName: `Cloud run ${serviceName} error codes`,
  });
  return alert;
}
