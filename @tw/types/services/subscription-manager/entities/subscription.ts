import { coupon } from './coupon';
import { subscriptionItem } from './subscriptionItem';
import { subscriptionType } from './subscriptionType';

export declare type subscription = {
  subscription: string;
  shop: string;
  customer: string;
  email: string;
  status: string;
  revenue: number;
  last_four: string;
  payment_method: string;
  card_brand: string;
  notes: string;
  cancel_reason: string | null;
  cancel_at_period_end: boolean;
  pause_collection_behavior: string;
  pause_collection_resumes_at: Date;
  items: subscriptionItem[];
  features: string[];
  coupon: coupon | null;
  promotion_code: string | null;
  full_price: number;
  total_price: number;
  billing_cycle: string;
  old_revenue: number | null;
  created_at: string;
  current_period_start: string;
  current_period_end: string;
  pause_reason: string | null;
  origin: string | null;
  uncapped: boolean;
  uncapped_until: string | null;
  uncapped_tier: string | null;
  contract_end_date?: string | Date;
  contract_type?: subscriptionType;
  collection_method?: 'charge_automatically' | 'send_invoice';
};
