import { ServicesIds } from '../services/general';
import { JobType } from '../types';
import { DataTypesIds } from '../services/general';

export declare type IntegrationRawFileMetadata = {
  serviceId: ServicesIds;
  accountId: string;
  dataType: DataTypesIds;
  jobType: JobType;
  jobHour?: string;
  jobDate?: string;
  timezone: string;
  currency?: string;
  jobSlot?: number;
  jobUTCDate: string;
  reportDate?: string;
  resourcesRequested?: string;
  paginationIndex?: number;
  paginationTotal?: number;
  jobID?: string;
};
