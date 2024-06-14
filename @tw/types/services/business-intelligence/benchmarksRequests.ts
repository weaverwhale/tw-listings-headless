import { IndustryTypes } from '../../types/IndustryType';

export const AOV_SEGMENTS = [">$100", "$100+"] as const;
export const REVENUE_SEGMENTS = [
  '<$1M',
  '$1M-$10M',
  '$10M+',
] as const;
export const SPEND_SEGMENTS = [
  "<10K",
  "10K-20K",
  "20K-50K",
  "50K-100K",
  "100K-250K",
  ">250K+",
] as const;

export type aovSegmentTypes = (typeof AOV_SEGMENTS)[number];
export type revenueSegmentTypes = (typeof REVENUE_SEGMENTS)[number];
export type spendSegmentTypes = (typeof SPEND_SEGMENTS)[number];

export type BenchmarksRequest = {
  shop_domain: string;
  category: IndustryTypes;
  aov_segment?: aovSegmentTypes;
  revenue_segment?: revenueSegmentTypes;
  spend_segment?: spendSegmentTypes;
  start: string;
  end: string;
  user?: string;
  compare_start?: string;
  compare_end?: string;
};
