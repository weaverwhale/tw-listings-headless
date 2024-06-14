import { subscriptionType } from './subscriptionType';

export declare type shopRequest = {
  shopDomain: string;
  prices: string[];
  revenueId?: Number;
  shopNotes?: string;
  subscriptionType?: subscriptionType;
};
