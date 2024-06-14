import { JobType } from '../../../types';
import { DataTypesIds } from '../../general';
import { ServicesIds } from '../../general/ServicesIds';
import { JobStatus } from './Job';

export * from '../../../types/JobType';

export type IntegrationJob = {
  serviceId: ServicesIds;
  accountId: string;
  type: JobType;
  status: JobStatus;
};

export type SingleIntegrationJob = {
  id: string;
  serviceId: ServicesIds;
  dataType: DataTypesIds;
  jobType: JobType;
  accountId: string;
  subAccountIds: string[];
  currentIndex: number;
  total: number;
  status: JobStatus;
  startDay: string;
  successful: boolean;
  createdAt: string;
  updatedAt: string;
  finishedAt: string;
  requestCancel: boolean;
  forceExternalFetch?: boolean;
};

export type IntegrationJobResponse = SingleIntegrationJob[];
