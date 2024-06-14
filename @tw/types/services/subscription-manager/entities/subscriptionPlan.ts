import { SubscriptionFeature } from '../../../types';
import { SalesPlatform } from '../../general';
import { BillingInterval } from './billingInterval';
import { subscriptionType } from './subscriptionType';

export type SubscriptionPlanType = 'package' | 'addon';

export declare type subscriptionPlan = {
  price_id: string;
  description: string;
  price: string;
  revenue_name: string;
  revenue_id: number;
  early_birds: boolean;
  for_sale: boolean;
  product_id: string;
  product_sort: number;
  product_name: string;
  product_description: string;
  product_flag: SubscriptionFeature;
  dependencies: string[];
  billing_interval: BillingInterval | null;
  product_type?: SubscriptionPlanType | null;
  product_msp: SalesPlatform | null;
  type?: string;
  interval_count: number;
  features?: SubscriptionFeature[];
  product_alpha?: boolean;
  tw_free?: boolean;
  plan_preview?: boolean;
  contract_type?: subscriptionType;
};
