export const shopMetricsServices = [
  'facebook-ads',
  'bing',
  'google-ads',
  'snapchat-ads',
  'tiktok-ads',
  'pinterest-ads',
  'other',
  'klaviyo',
  'twitter-ads',
] as const;

export declare type shopMetricsServiceData = {
  responses: number;
  price: number;
};

export declare type ShopMetrics = Record<
  (typeof shopMetricsServices)[number],
  shopMetricsServiceData
>;
