import { DataTypesIds, ServicesIds } from '../services/general';
import { CreativeAttributes } from './CreativeAttributes';
import { PickByType } from './PickByType';

export declare type AnalyticsObjectType = 'channel' | 'adAccount' | 'campaign' | 'adset' | 'ad';
export declare type AttributeStatus = 'ACTIVE' | 'PAUSED' | 'CANCELED';

export const budgetTypeArr = ['daily', 'lifetime'] as const;
export declare type BudgetType = (typeof budgetTypeArr)[number];

export declare type AllAttributeStatus = {
  [status in AttributeStatus]: status;
};

export const AttributeStatusRoles: AllAttributeStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELED: 'CANCELED',
};

export declare type AnalyticsAttributes = {
  id: string; // serviceId.dataType#accountId#campaignId#adsetId#adId
  serviceId: ServicesIds;
  dataType: DataTypesIds;
  accountId: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  entity: AnalyticsObjectType;
  name: string;
  campaignName?: string;
  adsetName?: string;
  status: AttributeStatus;
  budget?: number;
  budgetType?: BudgetType;
  imageUrl?: string;
  currency?: string;
  timezone?: string;
  urlParams?: string;
  creatives?: CreativeAttributes[];
  moreData?: any;
  adType?: number;
  campaignType?: string | number;
  isDynamicCreativeAdset?: boolean;
  campaignObjective?: string;
  links?: string[];
  productHandles?: string[];
  bodies?: string[];
  titles?: string[];
  videoIds?: string[];
  images?: string[];
  callToActionTypes?: string[];
};

export type allAnalyticsAttributes = {
  [attr in PickByType<keyof AnalyticsAttributes, string | number>]: attr;
};

export const AnalyticsAttributesRoles: allAnalyticsAttributes = {
  id: 'id',
  serviceId: 'serviceId',
  dataType: 'dataType',
  accountId: 'accountId',
  campaignId: 'campaignId',
  adsetId: 'adsetId',
  adId: 'adId',
  entity: 'entity',
  name: 'name',
  status: 'status',
  imageUrl: 'imageUrl',
  currency: 'currency',
  timezone: 'timezone',
  creatives: 'creatives',
  urlParams: 'urlParams',
  moreData: 'moreData',
  adType: 'adType',
  isDynamicCreativeAdset: 'isDynamicCreativeAdset',
  campaignObjective: 'campaignObjective',
  links: 'links',
  productHandles: 'productHandles',
  bodies: 'bodies',
  titles: 'titles',
  videoIds: 'videoIds',
  images: 'images',
  callToActionTypes: 'callToActionTypes',
  campaignType: 'campaignType',
  campaignName: 'campaignName',
  adsetName: 'adsetName',
  budget: 'budget',
  budgetType: 'budgetType',
};
