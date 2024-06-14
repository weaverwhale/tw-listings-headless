import { ServicesIds } from '../services';

export type ShopServiceData = {
  lastImportTimestamp?: Date;
  accounts?: { [accountId: string]: ServiceAccountData };
  serviceConfiguration?: TiktokConfig | FacebookConfig;
};

export type ServiceAccountData = {
  id?: string;
  invalidConnection?: InvalidConnection;
};

export type InvalidConnection = {
  invalidStateReason?: string;
  invalidStateCode?: string;
  jobId?: string;
  timestamp?: Date;
};

export type ServiceAccountParams = {
  shopDomain: string;
  serviceId: ServicesIds;
  accountId: string;
  invalidConnection?: InvalidConnection;
};

export type TiktokConfig = {
  purchasesEvent?: tiktokPurchasesEvent;
};

export type FacebookConfig = { };

export enum tiktokPurchasesEvent {
  COMPLETE_PAYMENT = 'completePayment',
  PLACE_AN_ORDER = 'placeAnOrder',
};