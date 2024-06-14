import { ServicesIds } from '../services/general';
import { MetricsTableRow } from './MetricsTableRow';

export const CreativeTypesArray = [
  'video',
  'image',
  'copy',
  'ad',
  'adName',
  'Segments',
  'product',
  'sku',
] as const;

export type CreativeTypes = typeof CreativeTypesArray[number];

export type AllCreativeTypes = {
  [type in CreativeTypes]: type;
};

export const CreativeTypesRoles: AllCreativeTypes = {
  ad: 'ad',
  adName: 'adName',
  image: 'image',
  video: 'video',
  copy: 'copy',
  Segments: 'Segments',
  product: 'product',
  sku: 'sku',
};

export type CreativeAttributes = {
  serviceId: ServicesIds;
  accountId: string;
  assetId: string;
  assetType: CreativeTypes;

  // only for creative type image / video
  thumbnail?: string; // thumbnail_url

  // only for creative type image
  image?: string; // image_url

  // only for creative type copy
  body?: string;

  // some creatives (image/video/copy) has title
  // title?: string;

  // some creatives has call to action (LEARN_MORE/SHOP_NOW etc.)
  // callToActionType?: string; // call_to_action_type
};

export type CreativeData = {
  assetId: string;
  assetType: CreativeTypes;
  isDynamic: boolean;
  weight: number;
};

export declare type CreativeMetricsTableRow = CreativeData & MetricsTableRow;
