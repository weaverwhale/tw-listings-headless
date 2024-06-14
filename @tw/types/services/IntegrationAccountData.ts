import { ServicesIds } from '.';

export type IntegrationAccountData = {
  serviceId: ServicesIds;
  accountId: string;
  token: any;
  timezone: string;
  currency: string;
  shopifyShopIds: {
    [key in string]: {
      shopId: string;
      subAccountIds?: {
        [key in string]: { subAccountId: string; [prop: string]: any };
      };
      [prop: string]: any;
    };
  };
  lastFetchTime?: string;
  createdAt?: string;
  [prop: string]: any;
  accountName?: string;
  status?: IntegrationAccountStatusEnum;
  statusMessage?: string;
};

export enum IntegrationAccountStatusEnum {
  error = 'error',
}
