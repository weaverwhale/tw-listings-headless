export type PixelBaseEvent<T, U extends PixelEventType> = {
  shopDomain: string;
  __eid: string;
  signalId?: string;
  monkeyId: string;
  timestamp: Date;
  version: string;
  source?: PixelEventSource,
  type: U,
  info: T
};

export type PixelEventAttributes = {
  shopDomain: string;
  version: string;
  __eid?: string;
  monkeyId: string;
  type: PixelEventType,
}

export enum PixelEventType {
  PAGE_LOAD = 'page load',
  CONTACT_DETAILS = 'contact details',
  CART_CHANGES = 'cart changes',
  CUSTOM = 'custom',
  IDENTIFY = 'identify',
  CHECKOUT = 'checkout',
  PUBLISH_ORDER = 'publish order',
  PURCHASE = 'purchase',
}

export enum PixelEventSource {
  PIXEL = 'pixel',
  KLAVIYO = 'klaviyo',
  ATTENTIVE = 'attentive',
  WISEPOPS = 'wisepops',
  PIXEL_API = 'pixel api',
  MISSED_URLS = 'missed urls',
  SHOPIFY_WEBHOOK = 'shopify webhook'
}
