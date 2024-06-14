export type SnapchatStatsPerHour = {
  impressions: number;
  swipes: number;
  spend: number;
  conversion_purchases: number;
  conversion_purchases_value: number;
};

export type SnapchatStatsPerDay = {
  conversion_purchases: number;
  conversion_purchases_value: number;
};

export type SnapchatTimeSeries = {
  start_time: string;
  end_time: string;
  stats: SnapchatStatsPerDay | SnapchatStatsPerHour;
};

export type SnapchatMetricsSeries = {
  id: string;
  granularity: 'DAY' | 'HOUR';
  start_time: string;
  end_time: string;
  timeseries: SnapchatTimeSeries[];
};

export type SnapchatAdsReportAds = {
  ad: {
    campaign_id: string;
    campaign_name: string;
    campaign_status: string;

    ad_squad_id: string;
    ad_squad_name: string;
    ad_squad_status: string;

    id: string;
    name: string;
    status: string;

    creative_id: string;
  };
  hourlyMetrics: SnapchatMetricsSeries;
  dailyMetrics: SnapchatMetricsSeries;
};

export type SnapchatAdsReport = {
  ads: SnapchatAdsReportAds[];
};

export type SnapchatAdsRawFile = {
  report: SnapchatAdsReport;
  adAccount: {
    id: string;
    name: string;
    timezone: string;
    currency: string;
  };
};
