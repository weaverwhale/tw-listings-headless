import { PixelBaseEvent, PixelEventType } from "./PixelBaseEvent";

export type PixelPageLoadEvent = PixelBaseEvent<PageLoadEvent, PixelEventType.PAGE_LOAD>;

type PageLoadEvent = {
  __eid: string,
  __client_at: Date,
  __cotkn: string,
  __email: string,
  __front_domain: string,
  __journey: string,
  __phone: string,
  __server_at: Date,
  __session: string,
  __shop: string,
  __tab: string,
  __title: string,
  __user: string,
  __ver: string,
  cart: {
    cnt: string,
    token: string,
    actions: [CartActionDetails]
  },
  capi_eid: string,
  capi_fbp: string,
  capi_fbc: string,
  capi_ky?: string,
  et_n: string,
  head_ip: string,
  head_ua: string,
  mon_h: number,
  mon_w: number,
  monkey_id: string,
  monkey_log: number,
  mov_click: number,
  mov_mouse: number,
  mov_scroll: number,
  mov_time: number,
  mov_touch: number,
  mov_travel: number,
  os_archit: string,
  os_bitness: number,
  os_brands_h: string,
  os_lang: string,
  os_mobile: boolean,
  os_model: string,
  os_plat: string,
  os_plat_v: string,
  os_tz1: string,
  os_tz2: string,
  os_ua_v: string,
  osv_major: number,
  osv_minor: number,
  pre_request: string,//pre_request id
  add_prd_i: string,//product id
  add_prd_n: string,//product name
  add_prd_p: string,//product price
  add_search: string,
  ref: ParsedURL,
  stor_local_id: string,
  url: ParsedURL,
};

export type CartActionDetails = { timestamp: Date, a: string, p: string, q: string };

export type ParsedURL = {
  path: string;
  query?: { [key: string]: string };
};
