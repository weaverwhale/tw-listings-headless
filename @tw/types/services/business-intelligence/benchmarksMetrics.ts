export const benchmarksMetricsRoles = [
  'size',
  'fb_ads_clicks_sum',
  'fb_ads_clicks_avg',
  'fb_ads_impressions_sum',
  'fb_ads_impressions_avg',
  'fb_ads_spend_sum',
  'fb_ads_spend_avg',
  'total_price_usd_sum',
  'total_price_usd_avg',
  'new_customer_total_price_sum',
  'new_customer_total_price_avg',
  'orders_sum',
  'orders_avg',
  'new_customers_sum',
  'new_customers_avg',
  'total_spend_usd',
  'total_spend_usd_avg',
] as const;

export type BenchmarksMetricsKeys = typeof benchmarksMetricsRoles[number];

export type BenchmarksMetrics = {
  [metric in BenchmarksMetricsKeys]: number;
};
