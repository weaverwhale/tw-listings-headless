import { Entity } from './MetricsEntity';
import { Granularity } from './Granularity';
import { DataTypesIds, ServicesIds } from '../services/general';
import { BTFamilies } from './BTFamilies';
import { FilterExpression, FilterExpressions } from './Filters';
import { AnalyticsAttributes } from './AnalyticsAttributes';
import { SortDirection } from './sortDirection';
import { AdsSortBy } from './AdsSortBy';

export type MetricsFilterOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_or_equal_than'
  | 'less_than'
  | 'less_or_equal_than';
export type MetricsFilterOperands =
  | 'campaign_id' // equals, not_equals
  | 'campaign_name' // all operators
  | 'adset_id' // equals, not_equals
  | 'adset_name' // all operators
  | 'ad_id' // equals, not_equals
  | 'ad_name' // all operators
  | 'roas'
  | 'cpc'
  | 'cpm'
  | 'spend'
  | 'impressions'
  | 'pixelRoas';

export type ShopifyMetricsFilterOperands = 'sources' | 'order_tags';
// | 'customer_tags' //will be added in the NEAREST future, pls don't delete

export type AdSegmentationFilters = {
  [service_id: string]: FilterExpressions<
    MetricsFilterOperands | ShopifyMetricsFilterOperands,
    MetricsFilterOperator
  >[]; // with AND between the expressions
};

export type MetricsFilterExpression = FilterExpression<
  MetricsFilterOperands | ShopifyMetricsFilterOperands,
  MetricsFilterOperator
>;

export declare type MetricsQueryStringParams = {
  start: string;
  end: string;
  data_type: DataTypesIds;
  account_ids: string[];
  granularity: Granularity;
  entity?: Entity;
  currency?: string;
  filters?: MetricsFilterExpression[][];
  filtersAllServices?: { [key in ServicesIds]?: MetricsFilterExpression[][] };
  fetchFiltersOnServer?: boolean;
  shopId?: string;
  family?: BTFamilies;
  attributes?: (keyof AnalyticsAttributes)[];
  sort_by?: AdsSortBy;
  sort_direction?: SortDirection;
  splitFetchMetricsTable?: boolean;
  useNexus?: boolean;
  forceBigTable?: boolean;
} & (
  | { service_id: ServicesIds; service_ids?: ServicesIds[] }
  | { service_ids: ServicesIds[]; service_id?: ServicesIds }
);
