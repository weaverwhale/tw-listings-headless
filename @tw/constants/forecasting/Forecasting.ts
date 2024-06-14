import { services } from '@tw/types/module/services';
import { ForecastingOptions } from '@tw/types/module/forecasting/Forecasting';

function pickBy(object, predicate = (v) => v) {
  const obj = {};
  for (const [key, value] of Object.entries(object)) {
    if (predicate(value)) obj[key] = value;
  }
  return obj;
}

export const ForecastingGroupByOptions: ForecastingOptions = [
  { id: 'week', definition: 'isoWeek', transformFrom: 'day', name: 'Week' },
  { id: 'month', definition: 'month', transformFrom: 'month', name: 'Month' },
  { id: 'quarter', definition: 'quarter', transformFrom: 'month', name: 'Quarter' },
  { id: 'year', definition: 'year', transformFrom: 'month', name: 'Year' },
];

export const adsServices = pickBy(services, (s) => {
  return ['google-ads', 'facebook-ads', 'tiktok-ads', 'snapchat-ads', 'pinterest-ads'].includes(
    s.id
  );
});

export const otherChannels = [
  {
    id: 'organic',
    name: 'Organic',
  },
  {
    id: 'other',
    name: 'Other',
  },
];

export const returningCustomerSegmentTypes = [
  { id: 'Newly Acquired Customer', title: 'Newly Aquired (last month)' },
  { id: 'Recently Acquired Customer', title: 'Recently Acquired (2-6 months)' },
  { id: 'Non-Recently Acquired Active Customer', title: 'Non-Recent Active (7+ months)' },
  { id: 'Reactivated', title: 'Reactivated (>7 months)' },
];

export const segmentedSegmentTypes = [
  { id: 'New Customer', title: 'New Customer' },
  ...returningCustomerSegmentTypes,
];

export const returingCustomerSegmentType = {
  id: 'CUSTOM Returning Customer',
  title: 'Returning Customer',
};

export const allSegementTypes = [
  { id: 'All Segments', title: 'All Customers' },
  ...segmentedSegmentTypes,
];

export const allSegementWithCustomTypes = [...allSegementTypes, returingCustomerSegmentType];

export const allSourcesTrafficSources = ['All Sources'];

export const allSourcesMetricNames = [
  'spend',
  'conversion_value',
  'clicks',
  'impressions',
  'purchases',
  'reported_aov',
  'reported_ROAS',
  'blended_ROAS',
  'nc_blended_ROAS',
  'blended_cpa',
  'nc_blended_cpa',
  'customer_cnt_attribution',
  'nc_customer_cnt_attribution',
  'aov_attribution',
  'nc_aov_attribution',
  'total_price_attribution',
];

export const shopTrafficSources = ['shopify'];

export const shopMetricNames = [
  'total_revenue',
  'first_order_revenue',
  'order_cnt',
  'num_customers',
  'purchase_rate',
  'aov',
];

export const paidTrafficSources = [
  'facebook-ads',
  'google-ads',
  'tiktok-ads',
  'snapchat-ads',
  'pinterest-ads',
  'All Paid Sources',
];

export const paidMetricNames = [
  'spend',
  'conversion_value',
  'clicks',
  'impressions',
  'purchases',
  'reported_aov',
  'reported_ROAS',
  'customer_cnt_attribution',
  'nc_customer_cnt_attribution',
  'aov_attribution',
  'nc_aov_attribution',
  'pixel_roas_calculated',
  'total_price_attribution',
];

export const organicTrafficSources = ['organic', 'All Organic Sources'];

export const otherTrafficSources = ['other', 'All Other Sources'];

export const organicOtherMetricNames = [
  'customer_cnt_attribution',
  'nc_customer_cnt_attribution',
  'aov_attribution',
  'nc_aov_attribution',
  'new_visitor_count',
  'nc_conversion_rate',
  'total_price_attribution',
];

export const trafficSourceTypes = [
  { type: 'organic', trafficSources: organicTrafficSources, metrics: organicOtherMetricNames },
  { type: 'other', trafficSources: otherTrafficSources, metrics: organicOtherMetricNames },
  { type: 'paid', trafficSources: paidTrafficSources, metrics: paidMetricNames },
  { type: 'shop', trafficSources: shopTrafficSources, metrics: shopMetricNames },
  {
    type: 'All Source Types',
    trafficSources: allSourcesTrafficSources,
    metrics: allSourcesMetricNames,
  },
];
