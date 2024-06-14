export interface Window {
    FingerprintJS: {
        load: (arg: { token: string }) => any,
    }
}

export type ThidData = undefined | {
    "requestId": string,
    "visitorId": string,
    "visitorFound"?: boolean,
    "meta"?: {
        "version": string
    },
    "confidence"?: number | {
        "score": number
    },
    "incognito": boolean,
    "browserName": string,
    "browserVersion": string,
    "device": string,
    "ip": string,
    "ipLocation": {
        "accuracyRadius": number,
        "latitude": number,
        "longitude": number,
        "postalCode": string,
        "timezone": string,
        "city": {
            "name": string
        },
        "country": {
            "code": string,
            "name": string
        },
        "continent": {
            "code": string,
            "name": string
        },
        "subdivisions": [
            {
                "isoCode": string,
                "name": string
            }
        ]
    },
    firstSeenAt?: any,
    lastSeenAt?: any,
    browser?: string,
    "os": string,
    "osVersion": string
}