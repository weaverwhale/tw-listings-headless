import { AmazonAccount } from '../services/amazon';
import { DataTypesIds } from '../services/general';
import { Shop } from '../Shop';
import { HealthCheckType, JobType } from '../types';

export enum CHECK_STATUS {
  GOOD = 'GOOD',
  INTERNAL_ZERO = 'INTERNAL_ZERO',
  DELTA = 'DELTA',
  INTERNAL_DELTA = 'INTERNAL_DELTA',
  UNKNOWN = 'UNKNOWN',
}
export type importDay = { day: string; status?: CHECK_STATUS };

export type FetchChunkData = {
  jobType: JobType;
  shopData: Shop;
  shopDomain: string;
  jobDate: string;
  jobHour: string;
  jobSlot: number;
  accountIds?: string[];
  dataType?: DataTypesIds;
  chunkSize?: number;
  day?: string;
  days?: importDay[]; // relevant if we are optimized initial before starting
  index?: number;
  total?: number;
  jobID?: string;
  forceExternalFetch?: boolean;
  resetDataBefore?: boolean;
  checkBefore?: boolean;
  healthCheckType?: HealthCheckType;
};
