import { AnalyticsAttributes } from './AnalyticsAttributes';
import { MetricsKeys } from './Metrics';

export type AdsSortBy = Pick<AnalyticsAttributes, 'name'> | MetricsKeys;
