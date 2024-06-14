import {PixelBaseEvent, PixelEventType} from "./PixelBaseEvent";

export type PixelPurchaseEvent = PixelBaseEvent<PurchaseDetailsEvent, PixelEventType.PURCHASE>;

type PurchaseDetailsEvent = {
    __email?: string,
    __phone?: string,
    [key: string]: string | number | boolean;
};
