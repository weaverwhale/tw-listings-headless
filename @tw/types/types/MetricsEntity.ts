export declare type Entity = 'channel' | 'ad_account' | 'campaign' | 'adset' | 'ad';
export declare type EntitiesIds = 'account_ids' | 'campaign_ids' | 'adset_ids' | 'ad_ids';

export declare type AllEntitiesIdsParams = {
  [entity in EntitiesIds]?: string[];
};

export type allEntities = {
  [t in Entity]: t;
};

export declare type smallEntities = {
  [t in Exclude<Entity, 'channel' | 'ad_account'>]: t;
};
