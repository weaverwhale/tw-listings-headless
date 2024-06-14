import { ApiMetricsResponse, MetricsTableData } from '@tw/types';
import { mergeAndSumObjectsToNumbersOnly } from './mergeAndSumObjectNumbersOnly';

export const aggregateMetrics = (metricsResponse: ApiMetricsResponse): MetricsTableData => {
  const { data } = metricsResponse || {};

  const agg: MetricsTableData = data.reduce((acc, curr) => {
    const forEntity = curr.metricsBreakdown.reduce((acc, curr) => {
      return mergeAndSumObjectsToNumbersOnly([acc, curr.metrics]);
    }, {});
    return mergeAndSumObjectsToNumbersOnly([acc, forEntity]);
  }, {});

  return agg;
};
