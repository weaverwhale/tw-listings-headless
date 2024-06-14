import { MetricsBreakdown } from '../ApiResponses';
import { CreativeTypes } from './CreativeAttributes';
import { FilterExpression, FilterExpressions } from './Filters';
import {
  AllMetricsAndPixelMetricsKeys,
  CalculatedMetrics,
  CalculatedPixelMetrics,
  RawMetrics,
  RawPixelMetrics,
} from './Metrics';
import { MetricsQueryStringParams } from './MetricsQueryStringParams';
import { AttributionDateModels, AttributionModels } from './Pixel';

export type CreativeFilterOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_or_equal_than'
  | 'less_than'
  | 'less_or_equal_than';

export type CreativeFilterOperands =
  | 'campaign_id'
  | 'campaign_name'
  | 'adset_id'
  | 'adset_name'
  | 'ad_id'
  | 'ad_name';

export type CreativeMetricFilterOperands =
  | 'roas'
  | 'cpc'
  | 'cpm'
  | 'spend'
  | 'impressions'
  | 'pixelRoas';

export type CreativeFilterExpression = FilterExpression<
  CreativeFilterOperands,
  CreativeFilterOperator
>;

export type CreativeMetricFilterExpression = FilterExpression<
  CreativeMetricFilterOperands,
  CreativeFilterOperator
>;

export type HighlightMetrics =
  | keyof RawMetrics
  | keyof RawPixelMetrics
  | keyof Pick<CalculatedMetrics, 'roas' | 'thumbStopRatio' | 'ctr'>
  | keyof Pick<CalculatedPixelMetrics, 'pixelRoas'>;

export type CreativeRequest = {
  entity: 'ad';
  creative_type: CreativeTypes;
  page: number;
  pageSize?: number;
  pixel_attribution_model: AttributionModels;
  pixel_date_model: AttributionDateModels;
  // filters?: FilterExpressions<CreativeFilterOperands, CreativeFilterOperator>[];
  filters?: FilterExpressions<CreativeMetricFilterOperands, CreativeFilterOperator>[];
  segments?: FilterExpressions<CreativeFilterOperands, CreativeFilterOperator>[];
  shopDomain: string;
  includeOneDayView?: boolean;
} & Omit<MetricsQueryStringParams, 'filters'>;

export type CreativeHighlightsRequest = {
  metrics: HighlightMetrics[];
  page?: 0;
} & CreativeRequest;

export type SegmentQuery = {
  metrics: AllMetricsAndPixelMetricsKeys;
  metricsBreakdown: MetricsBreakdown[];
  numberOfAds: number;
  thumbnails: string[];
};
