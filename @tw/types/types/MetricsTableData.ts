export declare type MetricsTableData = {
  spend?: number;
  conversionValue?: number;
  clicks?: number;
  impressions?: number;
  purchases?: number;
  allConversionValue?: number; // Require by Google Ads and apply only for it
  allConversions?: number; // Require by Google Ads and apply only for it
  oneDayViewConversionValue?: number; // for FB
  oneDayViewPurchasesValue?: number; // for FB
  outboundClicks?: number; // for FB
  totalVideoView?: number; // for FB
  threeSecondVideoView?: number; // for FB
  metaConversionValue?: number; // for FB
  metaPurchases?: number; // for FB
  campaignsConversionValue?: number; // for Klaviyo
  flowsConversionValue?: number; // for Klaviyo
  unsubscribed?: number; // for Klaviyo
  subscribedToList?: number; // for Klaviyo
  openedEmail?: number; // for Klaviyo
  receivedEmail?: number; // for Klaviyo
  clickedSms?: number; // for Klaviyo
  clickedEmail?: number; // for Klaviyo
  flowsCount?: number; // for Klaviyo
  totalCompletePaymentRate?: number; // for tiktok
  totalOnWebOrderValue?: number; // for tiktok
  completePayment?: number; // for tiktok
  onWebOrder?: number; // for tiktok
  engagements?: number; // for twitter ads
  follows?: number; // for twitter ads
};

// TODO: deprecate
export declare type MetricsTableDataWithCurrency = MetricsTableData & {
  currency?: string;
};
