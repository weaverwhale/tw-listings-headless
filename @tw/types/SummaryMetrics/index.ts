import { SummaryMetricsChartsSelectors } from './SummaryMetricsChartsSelectors';
import { SummaryMetricsIcons } from './SummaryMetricsIcons';
import { SummaryMetricIds } from './SummaryMetricsId';
import { SummaryMetricsStatsSelectors } from './SummaryMetricsStatsSelectors';
import { MetricsKeys } from '../metrics/metrics';
import { ServicesIds } from '../services';
import { valueFormats } from '../types';
import { FeatureFlag } from '@tw/feature-flag-system/module/types';
import React from 'react';
import { FilterRow, AggregationFunction, ExpressionElement } from '../willyTypes';

export const blendedServices: ServicesIds[] = [
  'shopify',
  'facebook-ads',
  'google-ads',
  'snapchat-ads',
  'tiktok-ads',
  'pinterest-ads',
  'bing',
];

export const DOLLAR_TYPE = '$';
export const PERCENT_TYPE = '%';
export const NUMBER_TYPE = 'number';

export const customMetric = <M extends SummaryMetricIdsTypes = any>(
  x: any
): BaseSummaryMetric<M> => ({
  id: x.id,
  title: x.title,
  color: '#7D4DFF',
  isShow: () => !x.shouldBeFiltered,
  valueToFixed: x.metricType === NUMBER_TYPE ? 2 : 0,
  type:
    x.metricType === DOLLAR_TYPE
      ? 'currency'
      : x.metricType === PERCENT_TYPE
      ? 'percent'
      : 'decimal',
  metricId: 'customMetrics',
  tip: x.description,
  services: [],
  isDynamicMetric: true,
  statObjectKey: x.id,
  isCustomMetric: true,
  chart: 'customMetricsCharts',
  icon: 'customMetrics',
});

export const willyMetric = <M extends SummaryMetricIdsTypes = any>(
  x: any
): BaseSummaryMetric<M> => ({
  id: x.id,
  title: x.title,
  color: '#7D4DFF',
  isShow: () => !x.shouldBeFiltered,
  valueToFixed: x.valueToFixed ?? 0,
  type: x.format ?? 'string',
  metricId: 'willyMetric',
  tip: x.description,
  services: [],
  isDynamicMetric: true,
  statObjectKey: x.id,
  chart: 'willyChart',
  icon: 'willy',
});

export const orderTagsMetric = <M extends SummaryMetricIdsTypes = any>(
  x: any
): BaseSummaryMetric<M> => {
  const id: M = String(x.original || x.id).trim() as M;
  return {
    id: id,
    title: id,
    color: '#7D4DFF',
    valueToFixed: 0,
    type: 'currency',
    metricId: 'order_tags',
    tip: 'Order tag from Shopify',
    services: ['SHOPIFY'],
    specificStat: 'revenue',
    isDynamicMetric: true,
    statObjectKey: id,
    chart: 'orderTagsCharts',
    icon: 'shopify',
  };
};

export const shopifySourcesMetric = <M extends SummaryMetricIdsTypes = any>(
  x: any
): BaseSummaryMetric<M> => {
  const id: M = String(x.original || x.id).trim() as M;
  const title = x.title ?? id;
  return {
    id,
    title,
    color: '#7D4DFF',
    valueToFixed: 0,
    type: 'currency',
    metricId: 'sources',
    tip: 'Source from Shopify',
    services: ['SHOPIFY'],
    specificStat: 'revenue',
    isDynamicMetric: true,
    statObjectKey: id,
    chart: 'sourcesCharts',
    icon: 'shopify',
  };
};

export type SummaryMetricsDictionary = {
  [id in SummaryMetricIdsTypes]: BaseSummaryMetric<id>;
};

export type BaseSummaryMetric<ID extends SummaryMetricIdsTypes> = {
  id: ID;
  metricId: SummaryMetricsStatsSelectorsNames;
  reportTitle?: string; // used for report header when we don't have the icon indication
  title: string;
  shortTitle?: string;
  features?: FeatureFlag[];
  chart?: SummaryMetricsChartsSelectorsNames;
  color: string;
  valueToFixed?: number;
  type: valueFormats;
  tip?: string;
  isNotRealTime?: boolean;
  positiveComparison?: number;
  isShow?: (stats: any) => boolean;
  isShowLoadWhenImport?: ServicesIds;
  services: (ServicesIds | string)[];
  relatedMetrics?: SummaryMetricIdsTypes[];
  isMinutes?: boolean;
  specificStat?: string;
  isDynamicMetric?: boolean;
  isCustomMetric?: boolean;
  providerId?: ServicesIds;
  metric?: MetricsKeys;
  statObjectKey?: SummaryMetricIdsTypes;
  icon: SummaryMetricsIconKeys | ((rootState?: any) => SummaryMetricsIconKeys | React.ReactNode);
  showOnlyForToday?: boolean;
  hasTarget?: boolean;
  hasBackgroundByDefault?: boolean;
  customMetricPopup?: string;
  metricPopupWidget?: boolean;
  additionalMarketplaceBadge?: boolean;
  dependOnCostSettings?: boolean;
  isCumulativeMetric?: boolean;
  isSupportCumulative?: boolean;
  isChartStartsWithMinValue?: boolean;
  willyMetricId?: string;
  willyConfig?: {
    id: string;
    relatedProvider?: ServicesIds;
    aggFunction?: AggregationFunction;
  } & (
    | {
        isCustomMetric: false;
        tableId: string;
        columnId: string;
        filter?: FilterRow[][] | any[][];
      }
    | {
        isCustomMetric: true;
        expression: ExpressionElement[];
      }
  );
};

export * from './SummaryMetricsStatsSelectors';
export type SummaryMetricsStatsSelectorsNames = (typeof SummaryMetricsStatsSelectors)[number];
export * from './SummaryMetricsId';
export type SummaryMetricIdsTypes = (typeof SummaryMetricIds)[number];
export * from './SummaryMetricsChartsSelectors';
export type SummaryMetricsChartsSelectorsNames = (typeof SummaryMetricsChartsSelectors)[number];
export * from './SummaryMetricsIcons';
export type SummaryMetricsIconKeys = (typeof SummaryMetricsIcons)[number];
export * from './SummaryMetrics';
