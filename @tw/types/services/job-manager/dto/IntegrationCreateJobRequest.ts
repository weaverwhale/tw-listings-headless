import { JobType } from '../../../types';
import { DataTypesIds, ServicesIds } from '../../general';
import { SingleIntegrationJob } from '../entities';

export declare type IntegrationCreateJobRequest = Partial<SingleIntegrationJob> & {
  day?: string;
  checkBefore?: boolean;
  resetDataBefore?: boolean;
  force?: boolean;
};
