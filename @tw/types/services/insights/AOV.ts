import { InsightsFilterQuery } from './filters/InsightFilter';

export type AOVRequestParams = {
  shopId: string;
  startDate: string;
  endDate: string;
  filters?: InsightsFilterQuery[];
  CDPSegmentId?: string;
};

export type AOVItem = {
  orderValue: number;
  totalOrders: number;
};

export type AOVResponse = {
  items: AOVItem[];
};
