import { ServicesIds } from '../general';
import { CDPSegmentQuery } from './queryBuilder/SegmentQuery';
import { SegmentInstance } from './SegmentInstance';
import { SegmentScheduler } from './SegmentReq';
import { SegmentType } from './SegmentType';

export declare type SegmentSync = {
  providerId: ServicesIds;
  accountId: string;
  isSynced: boolean;
  providerAudienceId: string;
  lastUpdatedAt: Date;
  error?: {
    errorDetail: string;
    errorMessage: string;
    createdAt: Date;
  }
};

export declare type Segment = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  shopDomain: string;
  query: CDPSegmentQuery;
  schedule: SegmentScheduler;
  type: SegmentType;
  FBAudienceId?: string;
  FBAdAccountId?:string;
  isFacebookSyncOn?: boolean;
  lastRunAt?: Date;
  lastInstance?: SegmentInstance;
  isPaused?: boolean;
  integrationsSyncDetails?: SegmentSync[];
  predefinedSegment?: {
    name: string;
    description?: string;
    schedule: SegmentScheduler;
    type: SegmentType;
    query: CDPSegmentQuery;
  };
};
