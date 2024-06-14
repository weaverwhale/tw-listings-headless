import { AllMetricsAndPixelMetricsKeys, RawMetrics } from '../types';
import { BaseApiResponse } from './BaseApiResponse';
import { MetricsResponseData } from './MetricsResponse';

export class InfluencersSummaryResponse extends BaseApiResponse<
  MetricsResponseData<RawMetrics | AllMetricsAndPixelMetricsKeys>[]
> {
  data: MetricsResponseData<RawMetrics | AllMetricsAndPixelMetricsKeys>[];
}
