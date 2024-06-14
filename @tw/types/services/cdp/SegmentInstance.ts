export enum CDPSegmentInstanceStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  UNDEFINED = 'UNDEFINED',
}

export enum SegmentMetric {
  CUSTOMERS_COUNT = "customersCount",
  LOYALTY = "loyalty",
  ORDERS_COUNT = "ordersCount",
  REVENUE = "revenue",
  HISTORICAL_LTV_30_DAYS = "historicalLTV30Days",
  HISTORICAL_LTV_60_DAYS = "historicalLTV60Days",
  HISTORICAL_LTV_90_DAYS = "historicalLTV90Days",
  HISTORICAL_LTV_180_DAYS = "historicalLTV180Days",
  HISTORICAL_LTV_365_DAYS = "historicalLTV365Days",
}

export declare type SegmentInstance = {
  id: string;
  segmentId: string;
  createdAt: Date;
} & {
  [metric in SegmentMetric]: number
};
