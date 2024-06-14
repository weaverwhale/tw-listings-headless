import { Stripe } from 'stripe';
import { shopRequest } from '../entities';
import { KeyValueObj } from './createSubscriptionRequest';

export declare type createSubscriptionsAgencyRequest = {
  email: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
  metadata?: KeyValueObj[];
  subscriptions: shopRequest[];
  paymentMethodId: string | Stripe.PaymentMethod;
  customerId?: string;
  promotionId?: string;
};
