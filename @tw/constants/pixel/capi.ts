import {
  CapiEventsConfig,
  PixelCartChangesEvent, PixelCheckoutEvent,
  PixelCustomerDetailsEvent, PixelCustomEvent,
  PixelEventType,
  PixelPageLoadEvent,
  PixelPublishOrderEvent,
  PixelPurchaseEvent
} from '@tw/types';

export const CapiEventsConfigMapper: CapiEventsConfig = {
  [PixelEventType.PAGE_LOAD]: [
    { type: 'pageLoad', condition: (e: PixelPageLoadEvent) => true, sources: ['meta'] },
    { type: 'newSession', condition: (e: PixelPageLoadEvent) => e.__eid == e.info.__tab, sources: ['klaviyo'] },
    { type: 'viewContent', condition: (e: PixelPageLoadEvent) => !!e.info.add_prd_i, sources: ['meta', 'klaviyo', 'tiktok'] },
    { type: 'search', condition: (e: PixelPageLoadEvent) => !!e.info.add_search, sources: ['meta'] }
  ],
  [PixelEventType.CONTACT_DETAILS]: [
    { type: 'signup', condition: (e: PixelCustomerDetailsEvent) => true, sources: ['meta'] },
    { type: 'newSession', condition: (e: PixelCustomerDetailsEvent) => e.source === 'klaviyo', sources: ['klaviyo'] }
  ],
  [PixelEventType.CART_CHANGES]: [
    { type: 'addToCart', condition: (e: PixelCartChangesEvent) => !!e.info.added?.length, sources: ['meta', 'klaviyo'] },
  ],
  [PixelEventType.CUSTOM]: [
    { type: 'custom', condition: (e: PixelCustomEvent) => true, sources: ['meta'] }
  ],
  [PixelEventType.IDENTIFY]: [],
  [PixelEventType.PURCHASE]: [
    { type: 'purchase', condition: (e: PixelPurchaseEvent) => true, sources: ['meta'] }
  ],
  [PixelEventType.CHECKOUT]: [
    { type: 'initiateCheckout', condition: (e: PixelCheckoutEvent) => e.info.sub_type == 'checkout_started', sources: ['meta'] },
    { type: 'addPaymentInfo', condition: (e: PixelCheckoutEvent) => e.info.sub_type == 'payment_info_submitted', sources: ['meta'] },
    { type: 'purchase', condition: (e: PixelCheckoutEvent) => e.info.sub_type == 'checkout_completed', sources: ['meta'] }
  ],
  [PixelEventType.PUBLISH_ORDER]: [
    { type: 'purchase', condition: (e: PixelPublishOrderEvent) => true, sources: ['meta'] }
  ],
}
