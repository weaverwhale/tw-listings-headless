type TiktokAdFormat = 'SINGLE_VIDEO' | 'SINGLE_IMAGE' | 'CAROUSEL';

export type TiktokReportEntry = {
  metrics: {
    ad_format: TiktokAdFormat;
    ad_id: number;
    ad_name: string;
    ad_text: string;
    adgroup_id: number;
    adgroup_name: string;
    adgroup_status: string;
    campaign_id: number;
    campaign_name: string;
    campaign_status: string;
    clicks: string;
    cpc: string;
    cpm: string;
    total_complete_payment_rate: string;
    total_on_web_order_value: string;
    complete_payment?: string;
    on_web_order?: string;
    video_watched_6s: string;
    video_play_actions: string;
    cta_conversion: string;
    ctr: string;
    image_ids: string[];
    impressions: string;
    purchase: string;
    conversion: string;
    spend: string;
    video_id: string;
    assetId: string | null;
    assetUrl: string | null;
  };
  dimensions: {
    stat_time_hour: string;
    ad_id: number;
  };
};

export type TiktokRawFile = {
  report: TiktokReportEntry[];
  adAccount: {
    id: string;
    currency: string;
  };
};
