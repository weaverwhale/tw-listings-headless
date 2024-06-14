import { importDay } from '../fetchers';
import { DataTypesIds, ServicesIds } from '../services/general';
import { IntegrationAccountData } from '../services/IntegrationAccountData';
import { JobType } from '../types';

export type IntegrationFetchChunkData = {
  jobType: JobType;
  accountData: IntegrationAccountData;
  serviceId: ServicesIds;
  accountId: string;
  jobDate: string;
  jobHour: string;
  jobSlot: number;
  subAccountIds?: string[];
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
};
