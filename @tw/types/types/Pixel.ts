export const AttributionDateModelsArr = ['eventDate', 'clickDate'] as const;

export type AttributionDateModels = (typeof AttributionDateModelsArr)[number];

export const AttributionModelsArr = [
  'lastClick',
  'firstClick',
  'fullLastClick',
  'fullFirstClick',
  'lastPlatformClick',
  'linear',
  'linearAll',
  'ppsViews',
  'fullLastClick-v2',
  'fullFirstClick-v2',
  'lastPlatformClick-v2',
  'linear-v2',
  'linearAll-v2',
] as const;

export type AttributionModels = (typeof AttributionModelsArr)[number];

export interface PixelIds {
  source: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
}

export interface Models {
  ids: PixelIds;
  modelName: AttributionModels;
  clickDate: string;
  clickHour: number;
}

export interface PixelMessage {
  models: Models[];
  coo: string;
  shopDomain: string;
  totalPrice: number;
  eventDate: string;
  eventHour: number;
  isNewCustomer: boolean;
  cogs: number;
}
