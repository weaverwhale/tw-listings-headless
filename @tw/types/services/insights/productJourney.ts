import { InsightsFilterQuery } from './filters/InsightFilter';

export type ProductJourneyParans = {
  shopId: string;
  startDate: string;
  endDate: string;
  filters?: InsightsFilterQuery[];
  CDPSegmentId?: string;
  top: number;
  limit?: number;
  searchTerm?: string;
};

export type ProductJourneyItem = {
  id: string;
  name: string;
  topItems: ProductJourneyItem[];
  totalOrders: number;
  totalNextOrders: number;
};

export type ProductJourneyData = {
  products: ProductJourneyItem[]
};
