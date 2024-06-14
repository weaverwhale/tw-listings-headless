export type conversionPurchases = {
  order_quantity: number[],
  sale_amount: number[],
  metric:number[]
}

export type TwitterAdsMetrics = {
  video_views_50: number[],
  impressions: number[],
  engagements: number[],
  tweets_send: number[],
  conversion_purchases: conversionPurchases,
  billed_charge_local_micro: number[],
  qualified_impressions: number[],
  video_views_75: number[],
  conversion_sign_ups: any,
  media_engagements: number[],
  follows: number[],
  video_3s100pct_views: number[],
  app_clicks: number[],
  retweets: number[],
  video_cta_clicks: number[],
  unfollows: number[],
  auto_created_conversion_session: any,
  likes: number[],
  video_content_starts: number[],
  video_views_25: number[],
  video_views_100: number[],
  clicks: number[],
  auto_created_conversion_landing_page_view: number[],
  media_views: number[],
  card_engagements: number[],
  video_6s_views: number[],
  poll_card_vote: number[],
  replies: number[],
  video_15s_views: number[],
  url_clicks: number[],
  video_total_views: number[][],
  carousel_swipes: number[]
}



export type TwitterAdsReport =
  {
    ad_id: string,
    ad_name: string,
    ad_status: string,
    line_item_id: string,
    line_item_name: string,
    line_item_status: string,
    campaign_id: string,
    campaign_name: string,
    campaign_status: string,
    segment: any,
    metrics: TwitterAdsMetrics
    date: string,
  }
  ;

export type TwitterRawFile = {
  report: TwitterAdsReport[];
  adAccount: {
    accountId: string;
    name: string;
    currency: string;
    timezone: string;
  };
};
