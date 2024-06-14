import Stripe from 'stripe';
import { createSubscriptionRequest } from './createSubscriptionRequest';
import { Overwrite } from '../../../sensory';
import { subscriptionType } from '../entities';

export declare type updateSubscriptionRequest = {
  subscribe: string[];
  unsubscribe: string[];
  coupon?: string;
  promotionCodeId?: string;
  revenueId?: number;
  paymentMethodId?: string | Stripe.PaymentMethod;
  shopNotes?: string;
  offerRedemption?: boolean;
  cancelAtPeriodEnd?: boolean;
  contractEndDate?: string | Date;
  contractType?: subscriptionType;
};
