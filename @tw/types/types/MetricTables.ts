import { DataTypesIds } from '../services';
import { CreativeTypes } from './CreativeAttributes';
import { AttributionDateModels, AttributionModels } from './Pixel';

export interface PixelMetrics {
  shop: string;
  source: string;
  account_id: string;
  campaign_id: string;
  adset_id?: string;
  ad_id?: string;
  date: string;
  hour: number;
  date_model: AttributionDateModels;
  attribution_model: AttributionModels;
  orders: number;
  total_price: number;
  total_cogs: number;
  new_customer_orders: number;
  new_customer_revenue: number;
  new_customer_cogs: number;
  visitors?: number;
  // new_visitors?: number;
}

export interface HourlyStatsKey {
  service_id: string;
  account_id: string;
  campaign_id: string;
  adset_id: string;
  ad_id: string;
  day: string;
  hour: number;
}
export type CreativeStatsKey = {
  asset_id: string;
  asset_type: CreativeTypes;
  thumbnail: string,
  image: string,
  body: string,
} & HourlyStatsKey;

export interface Metrics {
  spend: number;
  conversion_value: number;
  clicks: number;
  impressions: number;
  purchases: number;
  all_conversion_value?: number; // Require by Google Ads and apply only for it
  all_conversions?: number; // Require by Google Ads and apply only for it
  meta_purchases?: number;
  meta_conversion_value?: number;
  outbound_clicks?: number;
  one_day_view_conversion_value?: number; // for FB
  one_day_view_purchases_value?: number;//for FB  
}
export interface CreativeMetrics {
  spend: number;
  conversion_value: number;
  clicks: number;
  impressions: number;
  purchases: number;
  is_dynamic: boolean;
  weight: number;
  one_day_view_conversion_value?: number; // for FB
  one_day_view_purchases_value?: number;//for FB
  outbound_clicks?: number; // for FB
  total_video_view?: number; // for FB
  three_second_video_view?: number; // for FB
  meta_conversion_value?: number; // for FB
  meta_purchases?: number;  // for FB
}

export type CreativeStats = CreativeStatsKey & CreativeMetrics;
export type AdMetrics = {
  data_type: DataTypesIds;
  ad_type?: number;
} & HourlyStatsKey &
  Metrics;

export interface CreativeAttributesTable {
  account_id: string;
  asset_id: string;
  asset_type: string;
  body: string;
  image: string;
  service_id: string;
  thumbnail: string;
}

export type AdsAttribute = {
  account_id: string;
  service_id: string;
  name: string;
  status: string;
  campaign_id: string;
  ad_id: string;
  adset_id: string;
  image_url: string;
  currency: string;
  timezone: string;
  campaign_name: string;
  adset_name: string;
  account_name: string;
  campaign_status: string;
  adset_status: string;
};

export interface TwStats {
  metrics_pixel: PixelMetrics;
  metrics_creative: CreativeStats;
  metrics_ad: AdMetrics;
  metrics_creative_attribute: CreativeAttributesTable;
  metrics_ad_attribute: AdsAttribute;
}
