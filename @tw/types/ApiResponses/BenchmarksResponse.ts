import { BenchmarksMetrics } from '../services/business-intelligence/benchmarksMetrics';
import { BaseApiResponse } from './BaseApiResponse';
import { MetricsResponseData } from './MetricsResponse';

export class ApiBenchmarksResponse extends BaseApiResponse<
  MetricsResponseData<BenchmarksMetrics>[]
> {
  data: MetricsResponseData<BenchmarksMetrics>[];
}
