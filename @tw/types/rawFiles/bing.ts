export type BingReport = {
  AdId: string;
  AdStatus: string;
  AccountId: string;
  AdGroupId: string;
  AdGroupName: string;
  AdGroupStatus: string;
  CampaignId: string;
  CampaignName: string;
  CampaignStatus: string;
  TimePeriod: string;
  Conversions: string;
  Impressions: string;
  Spend: string;
  AllRevenue: string;
  Clicks: string;
  date?: string;
};

export type BingRawFile = {
  report: { report_results: BingReport[] };
  adAccount: {
    accountId: string;
    name: string;
    currency: string;
    timezone: string;
  };
};

export type BingAdMetrics = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  purchases: number;
};

export type BingAdData = {
  adData: any;
  dates: {
    [date: string]: {
      [hour: string]: BingAdMetrics;
    };
  };
};

export type BingAds = {
  [adId: string]: BingAdData;
};
