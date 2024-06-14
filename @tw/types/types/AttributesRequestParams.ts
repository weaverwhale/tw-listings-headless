import { DataTypesIds, ServicesIds } from '../services/general';
import { Entity } from './MetricsEntity';

export declare type AttributesRequestParams = {
  entity: Exclude<Entity, 'channel' | 'ad_account'>;
  service_id: ServicesIds;
  data_type: DataTypesIds;
  account_ids: string[];
  campaign_ids?: string[];
  adset_ids?: string[];
  ad_ids?: string[];
  shop_id?: string;
};

export declare type AttributesRequestByIdParams = {
  entity: Exclude<Entity, 'channel' | 'ad_account'>;
  id: string;
};

export declare type AttributesRequestByNameParams = {
  service_id: ServicesIds;
  data_type: DataTypesIds;
  account_ids: string[];
  name: string;
  entity: Exclude<Entity, 'channel'>;
};
