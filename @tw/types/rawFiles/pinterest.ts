export enum PinterestEntityStatus {
  ACTIVE = 1,
  PAUSED = 2,
  ARCHIVED = 3,
}

export type PinterestReportEntry = {
  CAMPAIGN_ID: number;
  CAMPAIGN_NAME: string;
  CAMPAIGN_ENTITY_STATUS: PinterestEntityStatus;
  AD_GROUP_ID: number;
  AD_GROUP_NAME: string;
  AD_GROUP_ENTITY_STATUS: PinterestEntityStatus;
  AD_ID: number;
  NAME: string;
  STATUS: 'ACTIVE' | 'PAUSED' | 'CANCELED';
  DATE: string;
  IMPRESSION_1: number;
  IMPRESSION_2: number;
  TOTAL_CLICKTHROUGH: number;
  SPEND_IN_DOLLAR: number;
  TOTAL_CHECKOUT: number; // purchases
  TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR: number; // conversion value
  URL_PARAMS: string;
};

export type PinterestRawFile = {
  report: PinterestReportEntry[];
  adAccount: {
    id: string;
    name: string;
    currency: string;
  };
};
