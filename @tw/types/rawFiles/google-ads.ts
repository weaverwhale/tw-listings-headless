export type GoogleAdsEntityProps = {
  id: number;
  name: string;
  resource_name: string;
  status?: number;
  tracking_url_template?: string;
  final_url_suffix?: string;
  advertising_channel_type?: number;
};

interface PolicySummaryInfo {
  review_status: string;
  approval_status: string;
}

interface Description {
  pinned_field: string;
  text: string;
  asset_performance_label: string;
  policy_summary_info: PolicySummaryInfo;
}

interface ResponsiveSearchAd {
  descriptions: Description[];
}

export type GoogleAdProps = {
  id: number;
  name?: any;
  type: number;
  text_ad?: any;
  expanded_text_ad?: any;
  expanded_dynamic_search_ad?: any;
  shopping_smart_ad?: any;
  shopping_product_ad?: any;
  video_ad?: any;
  image_ad?: any;
  responsive_search_ad: ResponsiveSearchAd;
  responsive_display_ad?: any;
  video_responsive_ad?: any;
  resource_name: string;
  tracking_url_template?: string;
  final_url_suffix?: string;
  final_urls?: string[];
};

export type GoogleAdsRawFile = {
  report: GoogleAdsReportEntry[];
  adAccount: {
    id: string;
    name: string;
    currency: string;
  };
  breakdowns: {
    gender: GoogleAdsReportEntry[];
    geographic: GoogleAdsReportEntry[];
    age_range: GoogleAdsReportEntry[];
    device: GoogleAdsReportEntry[];
    ad_network_type: GoogleAdsReportEntry[];
    click_type: GoogleAdsReportEntry[];
    slot: GoogleAdsReportEntry[];
  };
};

export type GoogleAdsReportEntry = {
  campaign: GoogleAdsEntityProps;
  ad_group: GoogleAdsEntityProps;
  ad_group_ad: {
    ad: GoogleAdProps;
    status: number;
    labels: any[];
    resource_name: string;
  };
  metrics: {
    cost_micros: number;
    conversions_value: number;
    all_conversions: number;
    conversions: number;
    clicks: number;
    ctr: number;
    all_conversions_value: number;
    impressions: number;
    video_quartile_p25_rate?: number;
  };
  segments: {
    date: string;
    device?: number; //relevant to breakdowns device
    ad_network_type?: number; //relevant to breakdowns ad_network_type
    click_type?: number; //relevant to breakdowns click_type
    slot?: number; //relevant to breakdowns slot
  };
  customer?: {
    resource_name: string;
    tracking_url_template?: string;
  };
  video?: {
    id: string;
    channel_id: string;
    title: string;
    duration_millis: number;
    resource_name: string;
  };
  asset?: {
    id: string;
    youtube_video_asset: {
      youtube_video_id: string;
    };
    resource_name: string;
  };
  ad_group_criterion?: {
    gender?: { type: number };
    age_range?: { type: number };
  }; // relevant to gender breakdown
  geographic_view?: { country_criterion_id: number }; // relevant to geographic breakdown
};
