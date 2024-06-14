import { AnalyticsAttributes, RawMetrics } from '../types';
import { AllMetricsAndPixelMetricsKeys } from '../types/Metrics';
import { ShopMetrics } from '../types/ShopMetrics';
import { BaseApiResponse } from './BaseApiResponse';

export type MetricsBreakdown<M = RawMetrics | AllMetricsAndPixelMetricsKeys | ShopMetrics> = {
  date: string;
  metrics: M;
};

export type MetricsResponseData<M = RawMetrics | AllMetricsAndPixelMetricsKeys | ShopMetrics> = {
  id: string;
  metricsBreakdown: MetricsBreakdown<M>[];
} & Partial<AnalyticsAttributes>;

export class ApiMetricsResponse extends BaseApiResponse<MetricsResponseData[]> {
  data: MetricsResponseData[];
}
