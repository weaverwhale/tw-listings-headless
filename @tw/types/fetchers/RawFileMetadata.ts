import { ServicesIds } from '../services/general';
import { JobType } from '../types';
import { DataTypesIds } from './../services/general';

export declare type RawFileMetadata = {
  shopId: string;
  serviceId: ServicesIds;
  dataType: DataTypesIds;
  jobType: JobType;
  accountId?: string;
  jobHour?: string;
  jobDate?: string;
  shopTimezone: string;
  jobSlot?: number;
  jobUTCDate: string;
  reportDate?: string;
  resourcesRequested?: string;
  paginationIndex?: number;
  paginationTotal?: number;
  jobID?: string;
  shopCurrency?: string;
};
