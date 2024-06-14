import { FilterProperty } from "./filters/FilterProperty";
import { InsightsFilterQuery } from "./filters/InsightFilter";

export type ProductAnalyticsParams = {
  shopId: string;
  startDate: string;
  endDate: string;
  includeFreeProducts: boolean;
  includeOnlyActiveProducts: boolean;
  page: number;
  limit?: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  groupBy:
  | FilterProperty.PRODUCT_ID
  | FilterProperty.PRODUCT_VARIANT_ID
  granularity: 'month' | 'week' | 'day' | 'hour';
  searchTerm?: string;
  productId?: string;
  filters: InsightsFilterQuery[];
}
