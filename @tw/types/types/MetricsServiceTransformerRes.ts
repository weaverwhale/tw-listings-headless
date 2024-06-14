import { AnalyticsAttributes } from './AnalyticsAttributes';
import { MetricsTransformer } from './MetricsTransformer';
import { RawFileMetadata } from '../fetchers';

export type MetricsServiceTransformerRes = {
  metadata: RawFileMetadata;
  rows: MetricsTransformer;
  attributes: AnalyticsAttributes[];
};
