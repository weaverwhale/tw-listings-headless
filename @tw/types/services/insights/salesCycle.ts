import { InsightsFilterQuery } from './filters/InsightFilter';

export type TimeBetweenPurchasesParams = {
  shopId: string;
  startDate: string;
  endDate: string;
  filters?: InsightsFilterQuery[];
  includeReturns?: boolean;
  limit?: number;
  CDPSegmentId?: string;
};

export type TimeBetweenPurchases = {
  days: number;
  totalOrders: number;
};

export type TimeBetweenPurchasesResponse = {
  secondOrder: TimeBetweenPurchases[],
  thirdOrder: TimeBetweenPurchases[],
  fourthOrder: TimeBetweenPurchases[]
};
