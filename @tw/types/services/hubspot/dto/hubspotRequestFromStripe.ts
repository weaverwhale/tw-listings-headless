import { subscriptionType } from '../../subscription-manager';

export declare type hubspotRequestFromStripe = {
  source?: 'STRIPE';
  subscription_id?: string;
  subscription_status?: string;
  shopDomain: string;
  discount?: string;
  features?: string[];
  items?: any[];
  total_price?: number;
  event_type?: string;
  email?: string;
  origin?: string;
  revenue_selected?: number;
  current_revenue?: number;
  subscription_canceled_date?: string;
  customer_id?: string;
  coupon_name?: string;
  subscription_start_date?: string;
  subscription_pause_start_date?: string | null;
  promo_code?: string;
  subscription_cancellation_requested_date?: string;
  subscription_canceled_by?: string;
  subscription_type?: subscriptionType;
  subscription_contract_end_date?: string;
  collection_method?: 'charge_automatically' | 'send_invoice';
};
