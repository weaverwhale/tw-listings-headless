import {PixelBaseEvent, PixelEventType} from "./PixelBaseEvent";

export type PixelCustomEvent = PixelBaseEvent<CustomEvent, PixelEventType.CUSTOM>;

type CustomEvent = {
    event_name: string;
    [key: string]: string | number | boolean | any;//The 'any' comes for SaaS companies that skip validation
};
