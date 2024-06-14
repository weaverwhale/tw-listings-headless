import { ServicesIds } from '../../general';

export declare type UpdateTodayRequest = {
  shopDomain: string;
  serviceId: ServicesIds;
  accountIds?: string[];
};
