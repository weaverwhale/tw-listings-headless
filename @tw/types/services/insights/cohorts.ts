import { InsightsFilterQuery } from "./filters/InsightFilter";

export enum TimeFrame {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
}

export type CohortsParams = {
  shopId: string;
  timeFrame: TimeFrame;
  filters: InsightsFilterQuery[];
  startDate: string;
  endDate: string;
  CDPSegmentId?: string;
};