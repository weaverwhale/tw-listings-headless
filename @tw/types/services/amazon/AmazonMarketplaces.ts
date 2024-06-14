export type AmazonRegions = 'na' | 'eu' | 'fe';

export enum AMAZON_REGIONS_ADS_URLS {
  na = 'https://advertising-api.amazon.com',
  eu = 'https://advertising-api-eu.amazon.com',
  fe = 'https://advertising-api-fe.amazon.com',
}
export enum AMAZON_REGIONS_LABELS {
  na = 'North America',
  eu = 'Europe',
  fe = 'Far East',
}

export enum AMAZON_MARKETPLACE_IDS {
  'A2EUQ1WTGCTBG2' = 'Canada',
  'ATVPDKIKX0DER' = 'United States of America',
  'A1AM78C64UM0Y8' = 'Mexico',
  'A2Q3Y263D00KWC' = 'Brazil',
  'A1RKKUPIHCS9HS' = 'Spain',
  'A1F83G8C2ARO7P' = 'United Kingdom',
  'A13V1IB3VIYZZH' = 'France',
  'AMEN7PMS3EDWL' = 'Belgium',
  'A1805IZSGTT6HS' = 'Netherlands',
  'A1PA6795UKMFR9' = 'Germany',
  'APJ6JRA9NG5V4' = 'Italy',
  'A2NODRKZP88ZB9' = 'Sweden',
  'AE08WJ6YKNBMC' = 'South Africa',
  'A1C3SOZRARQ6R3' = 'Poland',
  'ARBP9OOSHTCHU' = 'Egypt',
  'A33AVAJ2PDY3EV' = 'Turkey',
  'A17E79C6D8DWNP' = 'Saudi Arabia',
  'A2VIGQ35RCS4UG' = 'United Arab Emirates',
  'A21TJRUUN4KGV' = 'India',
  'A19VAU5U5O7RUS' = 'Singapore',
  'A39IBJ37TRP1C6' = 'Australia',
  'A1VC38T7YXB528' = 'Japan',
}

export enum AMAZON_MARKETPLACE_SELLER_TIMEZONES {
  'A2EUQ1WTGCTBG2' = 'America/Los_Angeles',
  'ATVPDKIKX0DER' = 'America/Los_Angeles',
  'A1AM78C64UM0Y8' = 'America/Bahia_Banderas',
  'A2Q3Y263D00KWC' = 'America/Los_Angeles',
  'A1RKKUPIHCS9HS' = 'CET',
  'A1F83G8C2ARO7P' = 'UTC',
  'A13V1IB3VIYZZH' = 'CET',
  'AMEN7PMS3EDWL' = 'CET',
  'A1805IZSGTT6HS' = 'CET',
  'A1PA6795UKMFR9' = 'CET',
  'APJ6JRA9NG5V4' = 'CET',
  'A2NODRKZP88ZB9' = 'CET',
  'AE08WJ6YKNBMC' = 'Africa/Johannesburg',
  'A1C3SOZRARQ6R3' = 'CET',
  'ARBP9OOSHTCHU' = 'Africa/Cairo',
  'A33AVAJ2PDY3EV' = 'Europe/Istanbul',
  'A17E79C6D8DWNP' = 'Asia/Riyadh',
  'A2VIGQ35RCS4UG' = 'Asia/Dubai',
  'A21TJRUUN4KGV' = 'Asia/Kolkata',
  'A19VAU5U5O7RUS' = 'Asia/Singapore',
  'A39IBJ37TRP1C6' = 'Australia/Sydney',
  'A1VC38T7YXB528' = 'Asia/Tokyo',
}
export type AmazonMarketplaces = keyof typeof AMAZON_MARKETPLACE_IDS;
