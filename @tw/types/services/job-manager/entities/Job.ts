import { JobType } from '../../../types';
import { DataTypesIds } from '../../general';
import { ServicesIds } from '../../general/ServicesIds';

export type JobStatus = 'in_progress' | 'done' | 'queued';

// exporting JobType types to avoid breaking the code if someone was using them in other services
export * from '../../../types/JobType';
// export declare type JobType = 'initial' | 'updateToday' | 'updateWeek';

// export type AllJobTypes = {
//   [type in JobType]: type;
// };

// export const JobTypes: AllJobTypes = {
//   initial: 'initial',
//   updateToday: 'updateToday',
//   updateWeek: 'updateWeek',
// };

export type AllJobsStatus = {
  [status in JobStatus]: status;
};

export const JobStatuses: AllJobsStatus = {
  in_progress: 'in_progress',
  done: 'done',
  queued: 'queued',
};

export type Job = {
  service_id: ServicesIds;
  type: JobType;
  status: JobStatus;
};

export type SingleJob = {
  id: string;
  serviceId: ServicesIds;
  dataType: DataTypesIds;
  jobType: JobType;
  shopDomain: string;
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

export type JobResponse = SingleJob[];
