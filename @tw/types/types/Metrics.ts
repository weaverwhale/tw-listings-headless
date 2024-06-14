export const RawMetricsKeysArr = [
  'spend',
  'conversionValue',
  'purchases',
  'clicks',
  'impressions',
  'subscriptionSignUps',
  'subscriptionSignUpsRate',
  'subscriptionChurns',
  'subscriptionChurnsRate',
  'allConversions',
  'allConversionValue',
  'outboundClicks',
  'oneDayViewConversionValue',
  'oneDayViewPurchasesValue',
  'threeSecondVideoView',
  'totalVideoView',
  'metaPurchases',
  'metaConversionValue',
  'sixSecondVideoView',
  'totalCompletePaymentRate',
  'completePayment',
  'onWebOrder',
  'totalOnWebOrderValue',
  'campaignsConversionValue',
  'flowsConversionValue',
  'unsubscribed',
  'subscribedToList',
  'openedEmail',
  'receivedEmail',
  'clickedSms',
  'clickedEmail',
  'bidAmount',
  'budget',
  'adsetBudget',
  'campaignBudget',
  'responsesRate',
  'responsesFacebook',
  'responsesInstagram',
  'responsesGoogle',
  'responsesSnapchat',
  'responsesPinterest',
  'responsesTikTok',
  'uniqueCustomers',
  'lifetimeValue',
  'frequency',
  'ltvPerCpa',
] as const;

export const CalculatedMetricsKeysArr = [
  'roas',
  'cpc',
  'ctr',
  'cpm',
  'cpa',
  'aov',
  'thumbStopRatio',
  'outboundCtr',
] as const;

export type RawMetricsKeys = (typeof RawMetricsKeysArr)[number];

export type CalculatedMetricsKeys = (typeof CalculatedMetricsKeysArr)[number];

export declare type RawMetrics = {
  [metric in RawMetricsKeys]?: number;
};

export declare type RawMetricsToConvert = keyof Pick<
  RawMetrics,
  | 'spend'
  | 'conversionValue'
  | 'allConversionValue'
  | 'oneDayViewConversionValue'
  | 'totalCompletePaymentRate'
  | 'totalOnWebOrderValue'
>;

export const allRawMetricsToConvert: Record<string, RawMetricsToConvert> = {
  spend: 'spend',
  conversionValue: 'conversionValue',
  allConversionValue: 'allConversionValue',
  oneDayViewConversionValue: 'oneDayViewConversionValue',
  totalCompletePaymentRate: 'totalCompletePaymentRate',
  totalOnWebOrderValue: 'totalOnWebOrderValue',
};

export const isMetricToConvert = (key: string): key is RawMetricsToConvert => {
  return Object.keys(allRawMetricsToConvert).includes(key);
};

export declare type CalculatedMetrics = {
  [metric in CalculatedMetricsKeys]?: number;
};

export type AllMetrics = {
  [metric in keyof (RawMetrics & Required<CalculatedMetrics>)]: metric;
};

export const rawPixelMandatoryMetricsNames = [
  'pixelPurchases',
  'pixelNcPurchases',
  'pixelConversionValue',
  'pixelNcConversionValue',
  'pixelCogs',
  'pixelNcCogs',
  'pixelVisitors',
  'pixelUniqueVisitors',
  'pixelNewVisitors',
  'pixelAtc',
  'pixelUniqueAtc',
  'pixelEmailSignup',
  'pixelProductCount',
] as const;

export const rawPixelOptionalMetricsNames = [
  'pixelTimeOnSite',
  'pixelBounces',
  'pixelNonBouncedVisitors',
  'pixelPageViews',
] as const;

type RawPixelMandatoryMetrics = {
  [metric in (typeof rawPixelMandatoryMetricsNames)[number]]: number;
};

type RawPixelOptionalMetrics = {
  [metric in (typeof rawPixelOptionalMetricsNames)[number]]: number;
};

export type RawPixelMetrics = RawPixelMandatoryMetrics & Partial<RawPixelOptionalMetrics>;

export const CalculatedPixelMetricsKeysArr = [
  'pixelRoas',
  'pixelCpa',
  'pixelNcCpa',
  'pixelAov',
  'pixelNcAov',
  'pixelProfit',
] as const;

export type CalculatedPixelMetricsKeys = (typeof CalculatedPixelMetricsKeysArr)[number];

export declare type CalculatedPixelMetrics = {
  [metric in CalculatedPixelMetricsKeys]?: number;
};

export const ExpandedCalculatedPixelMetricsKeysArr = [
  'pixelNcRoas',
  'pixelNcConversionRate',
  'pixelCostPerAtc',
  'pixelCostPerVisitor',
  'pixelCostPerNewVisitor',
  'pixelCostPerEmailSignup',
  'pixelEmailSignupRate',
  'pixelConversionRate',
  'pixelCvDelta',
  'pixelAvgTimeOnSite',
  'pixelAvgPageViews',
  'pixelBounceRate',
  'pixelAvgTouchpoints',
  'pixelAvgTimeToConversion',
  'pixelNewVisitorPerc',
  'pixelNcPurchasesPerc',
] as const;

export type ExpandedCalculatedPixelMetricsKeys =
  (typeof ExpandedCalculatedPixelMetricsKeysArr)[number];

export type ExpandedCalculatedPixelMetrics = {
  [metric in ExpandedCalculatedPixelMetricsKeys]?: number;
} & CalculatedPixelMetrics;

export type AllPixelMetrics = {
  [metric in keyof (RawPixelMetrics & Required<CalculatedPixelMetrics>)]: metric;
};

export type AllMetricsAndPixelMetricsKeys = RawMetrics &
  CalculatedMetrics &
  RawPixelMetrics &
  CalculatedPixelMetrics;

export const blendedMetrics = [
  'marketingEfficiencyRatio',
  'revenuePerSession',
  'netProfit',
  'netProfitMargin',
  'newCustomerCostPerAcquisition',
  'cashTurnover',
  'blendedSpend',
  'blendedConversionValue',
  'blendedPurchases',
  'blendedClicks',
  'blendedImpressions',
  'blendedAttributedRoas',
  'blendedCostPerAcquisition',
  'blendedRoas',
  'blendedCTR',
  'blendedCPC',
  'blendedNewCustomerRoas',
  'blendedCpc',
  'blendedCtr',
  'blendedCpm',
  'blendedCpa',
  'blendedNcCpa',
  'blendedAov',
  'blendedPoas',
] as const;

export type BlendedMetrics = (typeof blendedMetrics)[number];

export const ShopMetrics = [
  'orders',
  'ordersWithAmount',
  'refunds',
  'sales',
  'taxes',
  'shipping',
  'grossSales',
  'discounts',
  'newCustomerOrders',
  'newCustomerSales',
  'itemsSold',
  'itemsSoldAvg',
  'avgSold30',
  'totalSold30',
  'itemsSoldTotal',
  'netSales',
  'returningCustomerSales',
  'returningCustomerOrders',
  'refundsRate',
  'itemsInInventory',
  'conversionRate',
  'daysOfStock',
  'grossProfit',
  'returnRate',
  'returnsTotal',
  'customerCount',
  'contributionMargin',
  'contributionMarginPerUnit',
  'dateStockRunsOut',
  'rpr',
  'ltv60',
  'ltv90',
  'ltv180',
  'ltv365',
  'revenue',
  'orderValue',
  'ncOrderValue',
  'productNcAov',
  'productAov',
  'productCpa',
  'ordersWithProduct',
  'ncRevenue',
  'ncGrossProfit',
  'ncOrdersWithProduct',
  'adsInventory',
  'cogs',
  'cogsOrders',
  'cogsRefunds',
  'paymentGateways',
  'handlingFees',
  'inventoryItems',
  'inventoryItemsMissing',
  'inventoryCost',
  'inventoryValue',
  'newCustomersPercent',
  'oldCustomersPercent',
  'rcRevenue',
  'avgPurchasePrice',
  'modePurchasePrice',
  'addedToCartEvents',
  'customSpend',
  'sessions',
] as const;

export type ShopMetrics = (typeof ShopMetrics)[number];

export const MetricsKeysArr = [
  ...CalculatedMetricsKeysArr,
  ...RawMetricsKeysArr,
  ...rawPixelOptionalMetricsNames,
  ...rawPixelMandatoryMetricsNames,
  ...CalculatedPixelMetricsKeysArr,
  ...ExpandedCalculatedPixelMetricsKeysArr,
  ...blendedMetrics,
  ...ShopMetrics,
] as const;

export type MetricsKeys = (typeof MetricsKeysArr)[number];

export type EntityWithMetrics = {
  [metric in MetricsKeys]?: number;
};
