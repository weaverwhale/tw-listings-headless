import { ThidData } from "./ThidTypes";

export type TouchKind = `start` | `move` | `end` | `cancel`;
export type Vec2 = { x: number, y: number };
export type Size = { w: number, h: number };
export type AuxAlive = Deed[];
export type BrowserScreenSize = {
    w: number;
    h: number;
};

// 
export type BrowserAuxT = {
    "clr": string,
    "cpuN": string,
    "lang": string,
    "mem": string,
    "os": string,
    "screen": BrowserScreenSize,
    sys: string,
    "tz": string,
    "vendor": string,
    "ua": string,
    mob?: 1,// mobile or not

}
export type TrekGeo = {
    ip: string,
    at: string,// 36 encoded timestamp
    cont?: string,
    cntr?: string,
    cc: string,
    city?: string,
    lat?: number,
    lon?: number
}
// 
export type AuxPageURL = {
    "path": string,
    "query"?: { [varName: string]: string }
};

export type AuxPgBuzz = {
    sec: number,/// the length of the session
    deeds?: AuxPgLdHidden_deeds;
}

export type AuxPgLdHidden = AuxPgBuzz & {
    m: number,/// original events "m"
    eid: string,/// original events "a"
}
export type AuxPgLdHidden_deeds = {
    stir: { [key: string]: number },
    mouse: number
}

export type AuxPageLoaded = {
    "br": BrowserAuxT,
    "ref": AuxPageURL,
    "url": AuxPageURL,
    "urr": string,
    prev?: AuxPgLdHidden,// means "previous hidden" - contains session length info about previous session
};
export type AuxThankYou = AuxPageLoaded & {
    cart?: string,
    checkout?: string,
    thanks?: 1,
};
export type AuxAddToCart = {
    prod: string; /// id of the product added
    q: number;
};
export type AuxCapToken = {
    t: `p` | `e`;// phone or email
    v: string;
};
export type AuxClosed = { sec: number };
export type AuxPurchase = {
    price: number,
    currency: string,
    email: string,
    cart: AuxPurchaseProduct[];
};
export type AuxPurchaseProduct = {
    id: number;
    name: string;
    price: number;
}
export type TrekAux = AuxAlive | AuxPageLoaded | AuxThankYou | AuxCapToken | AuxAddToCart | AuxClosed | AuxPurchase | {};
export type Act =
    `page loaded`
    | `add2c`
    | `cart`
    | `checkout`
    | `nip` /// this happens when we capture candidates for email or phone, when people enter something, but never submit
    | 'purchase'
    ;
export type TrekParam = {
    a: string,/// event id
    extra?: any,/// some additional data that might be sent by any third party, like FB
    act: Act,
    aux: TrekAux,
}

export type ThirdPartiesAPI = {
    fbp?: string,
    fbc?: string,
}

export type TrekUserData = {
    shop: string, /// shop name
    front: string, /// current shop front domain
    shopDomain?: string,
    loc?: string,
    loc2?: string,
    coo: string,
    et: string,// etag cache id, taken from sound.txt
    thid?: string,// thumb id, taken from FingerprintJs, if needed
    usr?: ThidData | undefined,// thumb data, saved only on page loaded and only when thid is fetched 
}

export type TrekParamSrv = TrekParamExt & {
    serverTimestamp: number,
    frameStamp: number,// the timestamp rounded by frame size
}

export type TrekTraceObj = {
    title: string,
    log: string[],
}


export type TrekParamExt =
    TrekParam &
    TrekUserData &
    {
        traces?: TrekTraceObj[],
        restoredWith?: string,/// debug info for frontend
        m: number,
        mm?: number,// server time, set ONCE - this timestamp won't change on every PubSub!!!
        finger: string,/// our main (not anymore!)
        shopifyUser?: string,
        tab: string,/// this one is refreshed after each
        s: string,/// this one is refreshed after each fingerprintJS
        sessAt?: string,// 36 encoded time. if set - it means we created a new session at this point
        foo?: 1,// if the cookie was not set before this load - the "foo" is 1 then
        d?: 1,// is debug
        bo?: 1,// is bot
        nst?: 1,/// if 1 - means there is no local storage allowed in this browser,
        crt: string,// jenkins(crtCont)
        crtCont?: string,// cart contents encoded as string
        ctkn: string,/// latest cart token, from /cart.js or /cart/update.js
        diag?: { [metric: string]: number },/// diagnostics values
        cAPI?: ThirdPartiesAPI,
        missedURLs?: string[],/// list of missed urls
        geo?: TrekGeo,
        stg?: 1,/// if 1 - means we are in staging mode
    };
export type DeedKey = `travel` | `click` | `scroll` | `touch`;
export type Deed = { sec?: number, k: DeedKey, v: DeedValue };
export type DeedValue =
    Deed_travelAndScroll
    | Deed_clickAndTouch;
export type Deed_travelAndScroll = number;
export type Deed_clickAndTouch =
    Vec2
    & { _: string/* contains HTML obj info, like so: "{TAG}#{ID}.{classes list}"*/ };

export type TrekSoundTxt = {
    "channels": 2,// yes, only 2 are allowed
    "sampleRate": 44100, //yes, only 44100 are allowed
    "type": "loop", //yes, only "loop" allowed
    "data": number[]
};

export type BeaconNode = { id: string, url: string, data: { info: TrekParamExt } };


export type ShopConfigData = {
    capi: boolean,
    staging: boolean
    useNodeAttr: boolean,
}
