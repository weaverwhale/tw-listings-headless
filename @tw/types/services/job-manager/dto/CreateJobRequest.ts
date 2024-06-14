import { HealthCheckType, JobType } from '../../../types';
import { DataTypesIds, ServicesIds } from '../../general';

export declare type CreateJobRequest = {
  shopDomain: string;
  serviceId: ServicesIds;
  jobType: JobType;
  dataType?: DataTypesIds;
  day?: string;
  total?: number;
  forceExternalFetch?: boolean;
  checkBefore?: boolean;
  resetDataBefore?: boolean;
  force?: boolean;
  accountIds?: string[];
  resetShopServices?: boolean;
  healthCheckType?: HealthCheckType;
  fromTrends?: boolean;
};
