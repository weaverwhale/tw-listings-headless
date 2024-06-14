import { AttributeStatus } from '../types';

export type FacebookActionStat = {
  action_type: string;
  value?: string;
  ['1d_view']?: string;
  ['7d_click']?: string;
  ['1d_click']?: string;
  ['28d_click']?: string;
  ['28d_view']?: string;
};

export type FacebookReportDay = {
  spend: string;
  ad_id: string;
  purchase_roas?: FacebookActionStat[];
  actions?: FacebookActionStat[];
  video_play_actions?: FacebookActionStat[];
  clicks: string;
  three_second_video_view?: number; // this will be calculated by day
  total_video_view?: number; // this will be calculated by day
  purchases?: number; // this will be calculated by day
  impressions: string;
  outbound_clicks?: FacebookActionStat[];
  action_values?: FacebookActionStat[];
  reach?: number;
  frequency_value?: number;
  inline_post_engagement?: number;
  shops_assisted_purchases?: number;
  cost_per_thruplay?: FacebookActionStat[];
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  date_stop: string;
};

export type FacebookReportHour = FacebookReportDay & {
  hourly_stats_aggregated_by_advertiser_time_zone: string;
};

export type FacebookReportCountry = FacebookReportDay & {
  country: string;
};

export type FacebookReportPublisherPlatformPosition = FacebookReportDay & {
  publisher_platform: string;
  platform_position: string;
};

export type FacebookReportAgeGender = FacebookReportDay & {
  age: string;
  gender: string;
};

export type FacebookReportAge = FacebookReportDay & {
  age: string;
};

export type FacebookReportGender = FacebookReportDay & {
  gender: string;
};

export type FacebookReportFrequency = FacebookReportDay & {
  frequency_value: string;
};

export type FacebookAdCampaign = {
  id: string;
  name: string;
  effective_status: AttributeStatus;
  created_time: string;
  objective?: string;
};

export type FacebookAdset = {
  id: string;
  name: string;
  effective_status: AttributeStatus;
  is_dynamic_creative: boolean;
};

type FacebookDynamic<T extends FacebookDynamicTypes> = T extends 'images'
  ? {
      image_hash: string;
      image_url: string;
    }
  : T extends 'videos'
  ? {
      thumbnail_url: string;
      video_id: string;
    }
  : T extends 'bodies'
  ? {
      text: string;
    }
  : T extends 'link_urls'
  ? {
      website_url: string;
    }
  : {};

type FacebookDynamicTypes = 'images' | 'videos' | 'bodies' | 'link_urls';

type FacebookDynamicTypesMapper = {
  [type in FacebookDynamicTypes]: FacebookDynamic<type>;
};

export type FacebookDynamicCreative = {
  [dynamic in FacebookDynamicTypes]?: FacebookDynamicTypesMapper[dynamic][];
};

export type FacebookCreative = {
  id: string;
  name: string;
  thumbnail_url: string;
  object_id: string;
  actor_id: string;
  object_type: string;
  status: AttributeStatus;
  title?: string;
  body?: string;
  image_hash?: string;
  image_url?: string;
  adlabels?: string;
  asset_feed_spec?: FacebookDynamicCreative;
  applink_treatment?: string;
  playable_asset_id?: string;
  link_og_id?: string;
  link_url?: string;
  link_destination_display_url?: string;
  image_crops?: string;
  call_to_action_type?: string;
  video_id?: string;
  url_tags?: string;
  object_story_spec?: any;
};

export type FacebookAdData = {
  campaign: FacebookAdCampaign;
  adset: FacebookAdset;
  creative: FacebookCreative;
  effective_status: AttributeStatus;
  name: string;
  id: string;
};

export type Thumbnail = {
  thumbnail: string;
  adId: string;
  filename: string;
  hostingUrl: string;
  videoId?: string;
  imageHash?: string;
};

export type FacebookMainReportEntry = {
  hour: FacebookReportHour[];
  day: FacebookReportDay[];
  adsData: FacebookAdData[];
  creativeBreakdowns: CreativeBreakdown[];
  breakdowns: {
    country: FacebookReportCountry[];
    publisherPlatformPosition: FacebookReportPublisherPlatformPosition[];
    ageGender: FacebookReportAgeGender[];
    frequency: FacebookReportFrequency[];
    age: FacebookReportAge[];
    gender: FacebookReportGender[];
  };
  thumbnails: Thumbnail[];
};

export type FBAdAccount = {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  attributionWindow: string[];
};

export type FacebookRawFile = {
  report: FacebookMainReportEntry;
  adAccount: FBAdAccount;
};

export type BreakdownType = 'video_asset' | 'image_asset' | 'body_asset';

export interface CreativeBreakdown {
  breakdown: BreakdownType;
  insights: Insight[];
}

export interface Insight {
  spend: string;
  ad_id: string;
  actions?: Action[];
  video_play_actions?: VideoPlayAction[];
  clicks: string;
  impressions: string;
  date_start: string;
  date_stop: string;
  video_asset?: Videoasset;
  account_id: string;
  action_values?: Action[];
  image_asset?: Imageasset;
  purchase_roas?: Action[];
  body_asset?: Bodyasset;
  outbound_clicks?: OutboundClick[];
}

interface Bodyasset {
  text: string;
  id: string;
}

interface Imageasset {
  hash: string;
  url: string;
  name: string;
  id: string;
  image_crops?: Record<string, any[]>;
}

interface Videoasset {
  video_id: string;
  thumbnail_url?: string;
  thumbnail_hash?: string;
  id: string;
  url?: string;
}

interface Action {
  action_type: 'purchase' | string;
  value: string;
  '7d_click': string;
}

interface VideoPlayAction {
  value: string;
}

interface OutboundClick {
  value: string;
}
