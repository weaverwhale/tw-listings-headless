import { FilterProperty } from './filters/FilterProperty';
import { InsightsFilterQuery } from './filters/InsightFilter';

export type LTVRequestParams = {
  shopId: string;
  startDate: string;
  endDate: string;
  filters?: InsightsFilterQuery[];
  limit?: number;
  groupBy: FilterProperty.PRODUCT_ID | FilterProperty.ORDER_DISCOUNT_CODE;
  CDPSegmentId?: string;
  searchTerm?: string;
};

export type LTVItem = {
  id: string;
  name?: string;
  aov: number;
  ltv60days: number;
  ltv90days: number;
};

export type LTVResponse = {
  items: LTVItem[];
  total: LTVItem;
};
