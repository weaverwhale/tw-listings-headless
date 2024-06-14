import { coupon } from '../entities';

export declare type pricingOffer = {
  user?: string;
  creationDate?: Date;
  expirationDate?: Date;
  prices: { price_id: string; product_id: string }[];
  revenue?: number;
  coupon?: coupon;
  promotionCode?: { id: string; code: string };
  usedAt?: Date;
};
