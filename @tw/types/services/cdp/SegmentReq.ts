import { CDPSegmentQuery } from './queryBuilder/SegmentQuery';
import { SegmentSync } from './SegmentRes';
import { SegmentType } from './SegmentType';

export enum SegmentScheduler {
  EVERY_HOUR = 'every_hour',
  TWICE_A_DAY = 'twice_a_day',
  ONCE_A_DAY = 'once_a_day',
  ONCE_EVERY_OTHER_DAY = 'once_every_other_day',
  ONCE_A_WEEK = 'once_a_week',
  ONCE_A_MONTH = 'once_a_month',
}

export declare type CreateSegmentReq = {
  schedule?: SegmentScheduler;
  query: CDPSegmentQuery;
  type?: SegmentType;
  name: string;
  description?: string;
};

export declare type EditSegmentReq = {
  schedule?: SegmentScheduler;
  query?: CDPSegmentQuery;
  type?: SegmentType;
  name?: string;
};
