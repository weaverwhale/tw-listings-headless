import { Stripe } from 'stripe';
import { subscriptionType } from '../entities';

export declare type KeyValueObj = { key: string; value: string };

export declare type createSubscriptionRequest = {
  email?: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
  shopDomain: string;
  metadata?: KeyValueObj[];
  prices?: string[];
  paymentMethodId?: string | Stripe.PaymentMethod;
  customerId?: string;
  promotionId?: string;
  revenueId?: Number;
  shopNotes?: string;
  contractEndDate?: string | Date;
  contractType?: subscriptionType;
  collectionMethod?: 'charge_automatically' | 'send_invoice';
  _3_0?: number;
};
