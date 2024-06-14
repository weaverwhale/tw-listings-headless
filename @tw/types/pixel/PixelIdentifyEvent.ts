import { PixelBaseEvent, PixelEventType } from "./PixelBaseEvent";

export type PixelIdentifyEvent = PixelBaseEvent<IdentifyEvent, PixelEventType.IDENTIFY>;

type IdentifyEvent = {
  userId: string;
  [key: string]: string | number | boolean;
};
