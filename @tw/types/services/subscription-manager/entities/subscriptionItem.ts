import { BillingInterval } from './billingInterval';

export declare type subscriptionItem = {
  subscription_item: string;
  price: number;
  description: string;
  product_name: string;
  product_id: string;
  price_id: string;
  early_birds: boolean;
  plan_preview_start_date?: string;
  plan_preview_end_date?: string;
  billing_interval?: BillingInterval;
};
