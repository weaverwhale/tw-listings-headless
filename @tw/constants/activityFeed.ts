import { ServicesIds } from '@tw/types/module/services';
import { ActivityEntity, ActivityField, ActivityType } from '@tw/types/module/types/ActivityFeed';
import { formatChangeValue } from '@tw/helpers/module/activityFeedFormatting';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  serviceId: ServicesIds;
  entity: ActivityEntity;
  sourceField?: string[];
  field?: ActivityField;
  fieldValue?: (value) => any;
  to?: any[];
  label: string;
  url?: string;
  description?: (from, to, entity, currency) => string;
  entityName?: (entity) => string;
};

export const servicesEntities: Partial<Record<ServicesIds, Record<string, ActivityEntity>>> = {
  'facebook-ads': {
    CAMPAIGN: 'campaign',
    ADSET: 'adset',
    AD: 'ad',
  },
  'google-ads': {
    CAMPAIGN: 'campaign',
    ADSET: 'adset',
    AD: 'ad',
  },
  'tiktok-ads': {
    CAMPAIGN: 'campaign',
    ADGROUP: 'adset',
    AD: 'ad',
  },
  klaviyo: {
    campaigns: 'campaign',
  },
  'shopify':{
    VARIANT: 'variant',
  }
};

const allFacebookAdsActivities: ActivityItem[] = [
  {
    id: 'facebook-ads_campaign_create',
    type: 'create',
    serviceId: 'facebook-ads',
    entity: 'campaign',
    label: 'Facebook Campaign created',
  },
  {
    id: 'facebook-ads_campaign_status_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'campaign',
    label: 'Facebook Campaign status changes',
    sourceField: ['effective_status'],
    field: 'status',
    description: (from, to, entity) => `Campaign ${entity} ${to?.split('_').join(' ')}`,
  },
  {
    id: 'facebook-ads_campaign_name_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'campaign',
    label: 'Facebook Campaign name changes',
    field: 'name',
  },
  {
    id: 'facebook-ads_campaign_daily_budget_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'campaign',
    label: 'Facebook Campaign daily budget changes',
    field: 'daily_budget',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Campaign ${entity} budget ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'facebook-ads_adset_create',
    type: 'create',
    serviceId: 'facebook-ads',
    entity: 'adset',
    label: 'Facebook Adset created',
  },
  {
    id: 'facebook-ads_adset_status_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'adset',
    label: 'Facebook Adset status changes',
    sourceField: ['effective_status'],
    field: 'status',
    description: (from, to, entity) => `Adset ${entity} ${to?.split('_').join(' ')}`,
  },
  {
    id: 'facebook-ads_adset_name_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'adset',
    label: 'Facebook Adset name changes',
    field: 'name',
  },
  {
    id: 'facebook-ads_adset_daily_budget_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'adset',
    label: 'Facebook Adset daily budget changes',
    field: 'daily_budget',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Adset ${entity} budget ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'facebook-ads_adset_bid_amount_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'adset',
    label: 'Facebook Adset bid amount changes',
    field: 'bid_amount',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Adset ${entity} bid amount ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'facebook-ads_ad_create',
    type: 'create',
    serviceId: 'facebook-ads',
    entity: 'ad',
    label: 'Facebook Ad created',
  },
  {
    id: 'facebook-ads_ad_status_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'ad',
    label: 'Facebook Ad status changes',
    sourceField: ['effective_status'],
    field: 'status',
    description: (from, to, entity) => `Ad ${entity} ${to?.split('_').join(' ')}`,
  },
  {
    id: 'facebook-ads_ad_name_update',
    type: 'update',
    serviceId: 'facebook-ads',
    entity: 'ad',
    label: 'Facebook Ad name changes',
    sourceField: ['creative.name', 'name'],
    field: 'name',
  },
];

const allGoogleAdsActivities: ActivityItem[] = [
  {
    id: 'google-ads_campaign_create',
    type: 'create',
    serviceId: 'google-ads',
    entity: 'campaign',
    label: 'Google Campaign created',
  },
  {
    id: 'google-ads_campaign_name_update',
    type: 'update',
    serviceId: 'google-ads',
    entity: 'campaign',
    label: 'Google Campaign name changes',
    field: 'name',
  },
  {
    id: 'google-ads_adset_create',
    type: 'create',
    serviceId: 'google-ads',
    entity: 'adset',
    label: 'Google Adset created',
  },
  {
    id: 'google-ads_adset_name_update',
    type: 'update',
    serviceId: 'google-ads',
    entity: 'adset',
    label: 'Google Adset name changes',
    field: 'name',
  },
  {
    id: 'google-ads_ad_create',
    type: 'create',
    serviceId: 'google-ads',
    entity: 'ad',
    label: 'Google Ad created',
  },
  {
    id: 'google-ads_ad_name_update',
    type: 'update',
    serviceId: 'google-ads',
    entity: 'ad',
    label: 'Google Ad name changes',
    field: 'name',
  },
];

const allTikTokAdsActivities: ActivityItem[] = [
  {
    id: 'tiktok-ads_ad_create',
    type: 'create',
    serviceId: 'tiktok-ads',
    entity: 'ad',
    label: 'TikTok Ad created',
  },
  {
    id: 'tiktok-ads_ad_name_update',
    type: 'update',
    serviceId: 'tiktok-ads',
    entity: 'ad',
    label: 'TikTok Ad name changes',
    field: 'name',
  },
  {
    id: 'tiktok-ads_ad_display_name_update',
    type: 'update',
    serviceId: 'tiktok-ads',
    entity: 'ad',
    label: 'TikTok Ad display name changes',
    sourceField: ['display_name'],
    field: 'name',
  },
];

const allKlaviyoActivities: ActivityItem[] = [
  {
    id: 'klaviyo_campaign_status_update',
    type: 'update',
    serviceId: 'klaviyo',
    entity: 'campaign',
    label: 'Klaviyo Campaign status changes',
    field: 'status',
    sourceField: ['attributes.status'],
    to: ['Sent'],
    description: (from, to, entity) => `Campaign ${entity} ${to}`,
    entityName: (entity) => entity?.attributes?.name
  },
];

const allTripleWhaleActivities: ActivityItem[] = [
  {
    id: 'triple-whale_cdp_segment_create',
    type: 'create',
    serviceId: 'triple-whale',
    entity: 'cdp_segment',
    label: 'Triple Whale CDP Segment created',
  },
  {
    id: 'triple-whale_cdp_segment_syncToFacebook_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'cdp_segment',
    label: 'Triple Whale CDP Segment sync to Facebook changes',
    field: 'sync_to_facebook',
    description: (from, to, entity) => {
      const action = to ? 'synced' : 'un-synced';
      return `Segment ${entity} ${action} to Facebook`;
    },
  },
  {
    id: 'triple-whale_cdp_segment_syncToKlaviyo_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'cdp_segment',
    label: 'Triple Whale CDP Segment sync to Klaviyo changes',
    field: 'sync_to_klaviyo',
    description: (from, to, entity) => {
      const action = to ? 'synced' : 'un-synced';
      return `Segment ${entity} ${action} to Klaviyo`;
    },
  },
  {
    id: 'triple-whale_new_user_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'new_user',
    label: 'Triple Whale New User changes',
  },
  {
    id: 'triple-whale_integration_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'integration',
    label: 'Triple Whale Integration changes',
  },
  {
    id: 'triple-whale_post_purchase_survey_create',
    type: 'create',
    serviceId: 'triple-whale',
    entity: 'post_purchase_survey',
    label: 'Triple Whale Post Purchase Survey created',
  },
  {
    id: 'triple-whale_post_purchase_survey_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'post_purchase_survey',
    label: 'Triple Whale Post Purchase Survey changes',
  },
  {
    id: 'triple-whale_post_purchase_survey_delete',
    type: 'delete',
    serviceId: 'triple-whale',
    entity: 'post_purchase_survey',
    label: 'Triple Whale Post Purchase Survey deleted',
  },
  {
    id: 'triple-whale_campaign_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'campaign',
    label: 'Rules-engine FB Campaign changes',
  },
  {
    id: 'triple-whale_adset_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'adset',
    label: 'Rules-engine FB Adset changes',
  },
  {
    id: 'triple-whale_ad_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'ad',
    label: 'Rules-engine FB Ad changes',
  },
  {
    id: 'triple-whale_ad_create',
    type: 'create',
    serviceId: 'triple-whale',
    entity: 'ad',
    label: 'Triple Whale Generative AI Ad created',
  },
  {
    id: 'triple-whale_media_create',
    type: 'create',
    serviceId: 'triple-whale',
    entity: 'media',
    label: 'upload new media via triple whale',
  },
  {
    id: 'triple-whale_ad_status_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'ad',
    field: 'status',
    label: 'Facebook Ad status changes via triple whale',
  },
  {
    id: 'triple-whale_adset_status_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'adset',
    field: 'status',
    label: 'Facebook Adset status changes via triple whale',
  },
  {
    id: 'triple-whale_campaign_status_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'campaign',
    field: 'status',
    label: 'Facebook Campaign status changes via triple whale',
  },
  {
    id: 'triple-whale_adset_daily_budget_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'adset',
    field: 'daily_budget',
    label: 'Facebook Adset daily budget changes via triple whale',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Adset ${entity} budget ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'triple-whale_adset_lifetime_budget_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'adset',
    field: 'lifetime_budget',
    label: 'Facebook Adset lifetime budget changes via triple whale',
  },
  {
    id: 'triple-whale_adset_bid_amount_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'adset',
    field: 'bid_amount',
    label: 'Facebook Adset bid amount changes via triple whale',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Adset ${entity} bid amount ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'triple-whale_campaign_daily_budget_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'campaign',
    field: 'daily_budget',
    label: 'Facebook Campaign daily budget changes via triple whale',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Campaign ${entity} budget ${action} from ${formatChangeValue(+from/100, currency)} to ${formatChangeValue(+to/100, currency)}`;
    },
  },
  {
    id: 'triple-whale_campaign_lifetime_budget_update',
    type: 'update',
    serviceId: 'triple-whale',
    entity: 'campaign',
    field: 'lifetime_budget',
    label: 'Facebook Campaign lifetime budget changes via triple whale',
  },
];
const allShopifyActivities: ActivityItem[] = [
  {
    id: 'shopify_variant_stock_update',
    type: 'update',
    serviceId: 'shopify',
    entity: 'variant',
    field: 'inStock',
    label: 'Shopify Variant stock changes',
    description: (from, to, entity) => {
      const action = to ? 'Back in Stock': 'Out of Stock';
      return `Variant ${entity} ${action}`;
    },
    entityName: (entity) => `${entity?.product_title}-${entity?.title}` 
  },
  {
    id: 'shopify_variant_price_update',
    type: 'update',
    serviceId: 'shopify',
    entity: 'variant',
    field: 'price',
    label: 'Shopify Variant price changes',
    description: (from, to, entity, currency) => {
      const action = from > to ? 'decreased' : 'increased';
      return `Variant ${entity} price ${action} from ${formatChangeValue(from, currency)} to ${formatChangeValue(to, currency)}`;
    },
    entityName: (entity) => `${entity?.product_title}-${entity?.title}` 
  }

]

export const allActivities: ActivityItem[] = [
  ...allFacebookAdsActivities,
  ...allGoogleAdsActivities,
  ...allTikTokAdsActivities,
  ...allKlaviyoActivities,
  ...allTripleWhaleActivities,
  ...allShopifyActivities
];
