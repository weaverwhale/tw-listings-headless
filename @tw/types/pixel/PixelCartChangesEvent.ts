import {PixelBaseEvent, PixelEventType} from "./PixelBaseEvent";

export type PixelCartChangesEvent = PixelBaseEvent<CartChangesEvent, PixelEventType.CART_CHANGES>;

type CartChangesEvent = {
    ctkn: string;
    cnt: string;
    added: SimpleCartItem[];
    removed: SimpleCartItem[]
};

export type SimpleCartItem = {
    id: string;
    q: number;
    v?: string;
};
