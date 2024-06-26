import { MetricsDictionary } from '@tw/types/module/metrics/metrics';
import { shopMetrics } from './shopMetrics';
import { divide, sum } from './utils';
import { pixelMetrics } from './pixelMetrics';
import { blendedMetrics } from './blendedMetrics';
import { adsServices } from './constants';
import { subscriptionMetrics } from './subscriptionMetrics';

export const metrics: MetricsDictionary = {
  spend: {
    key: 'spend',
    label: 'Ad Spend',
    shortLabel: 'Spend',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInInfluencersHub: true,
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: true,
    allowOrderBy: true,
    pixelIndex: 100,
    chart: 'spendChart',
    calculateSum: (items) => {
      return sum(items, 'spend');
    },
  },
  conversionValue: {
    key: 'conversionValue',
    label: 'CV',
    shortLabel: 'CV',
    showInCreativeCard: [],
    showInCreativeTable: ['video', 'image', 'copy', 'ad', 'adName', 'Segments'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'conversionValueChart',
    calculateSum: (items) => {
      return sum(items, 'conversionValue');
    },
  },
  roas: {
    key: 'roas',
    label: 'ROAS',
    shortLabel: 'ROAS',
    showInCreativeCard: [],
    showInCreativeTable: ['video', 'image', 'copy', 'ad', 'adName', 'Segments'],
    showInRules: ['account', 'campaign', 'adset', 'ad', 'Segments'],
    showInServices: adsServices,
    showInInfluencersHub: false,
    format: 'decimal',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: true,
    allowOrderBy: true,
    pixelIndex: 3,
    calculateSum: (items) => {
      return divide(items, 'conversionValue', 'spend');
    },
    chart: 'chartPurchaseRoas',
  },
  purchases: {
    key: 'purchases',
    label: 'Purchases',
    shortLabel: 'Purchases',
    showInCreativeCard: ['video', 'image', 'copy', 'ad', 'adName'],
    showInCreativeTable: ['video', 'image', 'copy', 'ad', 'adName', 'Segments'],
    showInServices: adsServices,
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    format: 'decimal',
    toFixed: 1,
    minimumFractionDigits: 0,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'purchasesChart',
    calculateSum: (items) => {
      return sum(items, 'purchases');
    },
  },
  clicks: {
    key: 'clicks',
    label: 'Clicks',
    shortLabel: 'Clicks',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'clicksChart',
    calculateSum: (items) => {
      return sum(items, 'clicks');
    },
  },
  impressions: {
    key: 'impressions',
    label: 'Impressions',
    shortLabel: 'Impressions',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    allowOrderBy: true,
    chart: 'impressionsChart',
    calculateSum: (items) => {
      return sum(items, 'impressions');
    },
  },
  cpc: {
    key: 'cpc',
    label: 'CPC',
    shortLabel: 'CPC',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    allowOrderBy: true,
    valueIsNegative: true,
    chart: 'cpcChart',
    calculateSum: (items) => {
      return divide(items, 'spend', 'clicks');
    },
  },
  ctr: {
    key: 'ctr',
    label: 'CTR',
    shortLabel: 'CTR',
    showInCreativeCard: [],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'percent',
    toFixed: 2,
    minimumFractionDigits: 0,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'ctrChart',
    calculateSum: (items) => {
      return divide(items, 'clicks', 'impressions');
    },
  },
  cpm: {
    key: 'cpm',
    label: 'CPM',
    shortLabel: 'CPM',
    showInCreativeCard: [],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    allowOrderBy: true,
    valueIsNegative: true,
    chart: 'cpmChart',
    calculateSum: (items) => {
      return divide(items, 'spend', 'impressions', 1000);
    },
  },
  cpa: {
    key: 'cpa',
    label: 'CPA',
    shortLabel: 'CPA',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: true,
    showInPixelByDefault: false,
    allowOrderBy: true,
    valueIsNegative: true,
    chart: 'cpaChart',
    calculateSum: (items) => {
      return divide(items, 'spend', 'purchases');
    },
  },
  aov: {
    key: 'aov',
    label: 'AOV',
    shortLabel: 'AOV',
    showInCreativeCard: ['all'],
    showInCreativeTable: ['all'],
    showInServices: adsServices,
    format: 'currency',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'aovChart',
    calculateSum: (items) => {
      return divide(items, 'conversionValue', 'purchases');
    },
  },
  allConversionValue: {
    label: 'All CV',
    shortLabel: 'All CV',
    key: 'allConversionValue',
    showInServices: ['google-ads'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'allConversionValue');
    },
  },
  allConversions: {
    key: 'allConversions',
    label: 'All Purchases',
    shortLabel: 'All Purchases',
    showInServices: ['google-ads'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'allConversions');
    },
  },
  bidAmount: {
    key: 'bidAmount',
    label: 'Bid Amount',
    shortLabel: 'Bid Amount',
    showInServices: ['facebook-ads'],
    showInRules: ['adset'],
    showInCreativeCard: [],
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    showInCreativeTable: [],
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'bidAmount');
    },
  },
  outboundClicks: {
    key: 'outboundClicks',
    label: 'Outbound Clicks',
    shortLabel: 'OB Clicks',
    showInServices: ['facebook-ads'],
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    showInCreativeCard: [],
    showInCreativeTable: ['all'],
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'outboundClicks');
    },
  },
  outboundCtr: {
    key: 'outboundCtr',
    label: 'Outbound CTR',
    shortLabel: 'OB CTR',
    showInServices: ['facebook-ads'],
    showInRules: ['account', 'campaign', 'adset', 'ad'],
    showInCreativeCard: [],
    showInCreativeTable: ['all'],
    format: 'percent',
    toFixed: 2,
    minimumFractionDigits: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    chart: 'ctrChart',
    hideInActivities: true,
    calculateSum: (items) => {
      return divide(items, 'outboundClicks', 'impressions');
    },
  },
  oneDayViewConversionValue: {
    key: 'oneDayViewConversionValue',
    label: '1 Day View CV',
    shortLabel: '1D CV',
    showInServices: [],
    showInCreativeCard: [],
    showInCreativeTable: [],
    format: 'currency',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'oneDayViewConversionValue');
    },
  },
  threeSecondVideoView: {
    key: 'threeSecondVideoView',
    label: 'Thumb Stop View (3sec Video View)',
    shortLabel: 'TSV (3s VV)',
    showInServices: ['facebook-ads', 'google-ads'],
    showInCreativeCard: ['video'],
    showInCreativeTable: ['video'],
    format: 'decimal',
    toFixed: 0,
    hideInPixel: true,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'threeSecondVideoView');
    },
  },
  sixSecondVideoView: {
    key: 'sixSecondVideoView',
    label: 'Thumb Stop View (6sec Video View)',
    shortLabel: 'TSV (6s VV)',
    showInServices: ['tiktok-ads'],
    showInCreativeCard: ['video'],
    showInCreativeTable: ['video'],
    format: 'decimal',
    toFixed: 0,
    hideInPixel: true,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'sixSecondVideoView');
    },
  },
  totalVideoView: {
    key: 'totalVideoView',
    label: 'Total Video View',
    shortLabel: 'TVV',
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInServices: ['google-ads'],
    format: 'decimal',
    toFixed: 0,
    hideInPixel: true,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'totalVideoView');
    },
  },
  thumbStopRatio: {
    key: 'thumbStopRatio',
    label: 'Thumb Stop Ratio',
    shortLabel: 'Thumb Stop Ratio',
    showInCreativeCard: ['video'],
    showInCreativeTable: ['video'],
    showInServices: ['facebook-ads', 'google-ads', 'tiktok-ads'],
    format: 'percent',
    toFixed: 2,
    hideInPixel: true,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInActivities: true,
    calculateSum: (items) => {
      return sum(items, 'thumbStopRatio');
    },
  },
  conversionRate: {
    key: 'conversionRate',
    label: 'Conversion Rate',
    shortLabel: 'Conversion Rate',
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInServices: adsServices,
    format: 'percent',
    toFixed: 2,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    hideInPixel: true,
    hideInActivities: true,
  },
  campaignsConversionValue: {
    key: 'campaignsConversionValue',
    label: 'Campaigns Conversion Value',
    shortLabel: 'Campaigns Conversion Value',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoPlacedOrderTotalPriceCampaigns',
    calculateSum: (items) => {
      return sum(items, 'campaignsConversionValue');
    },
  },
  flowsConversionValue: {
    key: 'flowsConversionValue',
    label: 'Flows Conversion Value',
    shortLabel: 'Flows Conversion Value',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoPlacedOrderTotalPriceFlows',
    calculateSum: (items) => {
      return sum(items, 'flowsConversionValue');
    },
  },
  unsubscribed: {
    key: 'unsubscribed',
    label: 'Unsubscribed',
    shortLabel: 'Unsubscribed',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoUnsubscribed',
    calculateSum: (items) => {
      return sum(items, 'unsubscribed');
    },
  },
  subscribedToList: {
    key: 'subscribedToList',
    label: 'Subscribed To List',
    shortLabel: 'Subscribed To List',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoSubscribedToList',
    calculateSum: (items) => {
      return sum(items, 'subscribedToList');
    },
  },
  openedEmail: {
    key: 'openedEmail',
    label: 'Opened Email',
    shortLabel: 'Opened Email',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    calculateSum: (items) => {
      return sum(items, 'openedEmail');
    },
    hideInActivities: true,
  },
  receivedEmail: {
    key: 'receivedEmail',
    label: 'Received Email',
    shortLabel: 'Received Email',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoReceivedEmail',
    calculateSum: (items) => {
      return sum(items, 'receivedEmail');
    },
  },
  clickedSms: {
    key: 'clickedSms',
    label: 'Clicked SMS',
    shortLabel: 'Clicked SMS',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoClickedSms',
    calculateSum: (items) => {
      return sum(items, 'clickedSms');
    },
  },
  clickedEmail: {
    key: 'clickedEmail',
    label: 'Clicked Email',
    shortLabel: 'Clicked Email',
    showInServices: ['klaviyo'],
    showInCreativeCard: [],
    showInCreativeTable: [],
    hideInPixel: true,
    format: 'decimal',
    toFixed: 0,
    type: 'ads',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: false,
    chart: 'chartKlaviyoClickedEmail',
    calculateSum: (items) => {
      return sum(items, 'clickedEmail');
    },
  },
  customSpend: {
    key: 'customSpend',
    label: 'Custom Spend',
    shortLabel: 'Custom Spend',
    showInCreativeCard: [],
    showInCreativeTable: [],
    format: 'currency',
    toFixed: 2,
    type: 'shop',
    showInCreativeByDefault: false,
    showInPixelByDefault: false,
    allowOrderBy: true,
    calculateSum: (items) => {
      return sum(items, 'customSpend');
    },
  },

  ...blendedMetrics,
  ...shopMetrics,
  ...pixelMetrics,
  ...subscriptionMetrics,
};
