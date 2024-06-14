import {PixelBaseEvent, PixelEventType} from "./PixelBaseEvent";
import {ParsedURL} from './PixelPageLoadEvent';

export type PixelCheckoutEvent = PixelBaseEvent<CheckoutEvent, PixelEventType.CHECKOUT>;

type CheckoutEvent = {
    __eid: string,
    __client_at: Date,
    __cotkn: string,
    __email: string,
    __order_id: string,
    __phone: string,
    __server_at: Date,
    __shop: string,
    __user: string,
    __ver: string,
    add_eid: string,
    chk_cur: string,
    chk_i: [string],
    chk_v: string,
    head_ip: string,
    head_ua: string,
    mon_h: number,
    mon_w: number,
    monkey_id: string,
    monkey_log: number,
    osv_major: number
    osv_minor: number,
    ref: ParsedURL,
    sub_type: CheckoutEventSubType,
    url: ParsedURL
};

export type CheckoutEventSubType = 'checkout_started' | 'payment_info_submitted' | 'checkout_completed';
