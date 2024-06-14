import {PixelBaseEvent, PixelEventType} from "./PixelBaseEvent";

export type PixelCustomerDetailsEvent = PixelBaseEvent<CustomerDetailsEvent, PixelEventType.CONTACT_DETAILS>;

type CustomerDetailsEvent = {
    __email?: string,
    __phone?: string
};
