import { createAlert } from '../monitoring';
import { monitoringState } from '../monitoring/state';
import { getConfigs } from '../utils';

export function createDefaultSqlAlerts() {
  if (!monitoringState.sql.enabled) return;
  const { serviceId } = getConfigs();
  createAlert({
    name: 'default-sql-cpu-alert',
    displayName: `SQL ${serviceId} - CPU Utilization`,
    slack: true,
    conditions: [
      {
        displayName: 'Cloud SQL Database - CPU utilization',
        conditionThreshold: {
          filter: `resource.type = "cloudsql_database" AND metric.type = "cloudsql.googleapis.com/database/cpu/utilization" AND metadata.user_labels.service-id = "${serviceId}"`,
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
          thresholdValue: 0.5,
        },
      },
    ],
  });

  createAlert({
    name: 'default-sql-memory-alert',
    displayName: `SQL ${serviceId} - Memory utilization`,
    slack: true,
    conditions: [
      {
        displayName: 'Cloud SQL Database - Memory utilization',
        conditionThreshold: {
          filter: `resource.type = "cloudsql_database" AND metric.type = "cloudsql.googleapis.com/database/memory/utilization" AND metadata.user_labels.service-id = "${serviceId}"`,
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
          thresholdValue: 0.5,
        },
      },
    ],
  });
}
