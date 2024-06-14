import { ServicesIds } from '../services';
import { CreativeTypes, valueFormats, MetricsKeys as keys } from '../types';

// this export statement is just to avoid breaking changes in the module that imports this file
// it should be removed in the future
// if you want to add more metrics keys, add them to the MetricsKeys type
export type MetricsKeys = keys;

export type MetricData<M extends MetricsKeys> = {
  key: M;
  label: string;
  shortLabel: string;
  showInServices?: ServicesIds[];
  showInCreativeCard: (CreativeTypes | 'all')[];
  showInCreativeTable: (CreativeTypes | 'all')[];
  showInInfluencersHub?: boolean;
  format: valueFormats;
  toFixed: number;
  minimumFractionDigits?: number;
  type: 'ads' | 'pixel' | 'shop' | 'analytics' | 'lifetimeValue' | 'postPurchaseSurvey' | 'budget';
  showInCreativeByDefault: boolean;
  showInPixelByDefault: boolean;
  showInReport?: boolean;
  showInRules?: string[];
  allowOrderBy: boolean;
  pixelIndex?: number;
  valueIsNegative?: boolean;
  hideInPixel?: boolean;
  dependOnServices?: ServicesIds[];
  dependOnActiveIntegrations?: ServicesIds[]; // Must Have At Least One Service
  chart?: string;
  icon?: string;
  hideInActivities?: boolean;
  calculateSum?: (itemsWithMetric: any[]) => number;
};

export type MetricsDictionary = {
  [metric in MetricsKeys]?: MetricData<metric>;
};
