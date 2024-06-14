import { JobType } from '../job-manager';

export type QMCancelTaskRequest = {
  accountId?: string;
  endpoints?: string[];
  jobType?: JobType;
  jobId?: string;
  groupId?: string;
  pendingRedisKeys?: string[];
  pendingRedisKeyPrefix?: string;
};
