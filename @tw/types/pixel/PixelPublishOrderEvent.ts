import {ShopifyOrderForAttribution} from "./ShopifyOrderForAttribution";
import {PixelBaseEvent, PixelEventType} from './PixelBaseEvent';

export type PixelPublishOrderEvent = PixelBaseEvent<PublishOrderEvent, PixelEventType.PUBLISH_ORDER> & {providerId: Platforms};

type PublishOrderEvent = {
    orderId: string,
    order: ShopifyOrderForAttribution,
    monkeyId: string,
    customerId: string
}

export enum Platforms {
    SHOPIFY = 'SHOPIFY',
    woocommerce = 'woocommerce',
    bigcommerce = 'bigcommerce',
    STRIPE = 'STRIPE'
}
