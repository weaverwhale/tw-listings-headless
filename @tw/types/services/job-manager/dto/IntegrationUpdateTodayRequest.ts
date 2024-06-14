import { ServicesIds } from '../../general';

export declare type IntegrationUpdateTodayRequest = {
  serviceId: ServicesIds;
  accountId: string;
  subAccountIds?: string[];
};
