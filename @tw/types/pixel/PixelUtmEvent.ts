import {ParsedURL} from "./PixelPageLoadEvent";

export type PixelUtmEvent = {
    shopDomain: string;
    __eid: string;
    monkeyId: string;
    timestamp: Date;
    version: string;
    type: 'utm',
    info: {
        ref: ParsedURL,
        url: ParsedURL
    }
};
