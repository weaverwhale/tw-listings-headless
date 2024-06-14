import { SortDirection } from "../types";

export type ForecastingGroupByOption = {
  id: string;
  definition: 'month' | 'quarter' | 'year' | 'week' | 'isoWeek';
  transformFrom: 'month' | 'day';
  name: string;
};

export type ForecastingOptions = ForecastingGroupByOption[];

export type ForecastingRow = {
  name: string;
  collapsable?: boolean;
  level: number;
  key: string;
  type: 'money' | 'ratio' | 'count';
  children?: ForecastingRow[];
  customKey?: boolean;
  customKeyFunction?: 'divide' | 'sum' | 'average' | 'subtract';
  customKeyData?: any;
  hidden?: boolean;
  isParentProductRow?: boolean;
  isAdServiceParentRow?: boolean;
  adService?: string;
  chartLabel?: string;
};

export enum ForecastingMetric {
  InventoryRevenueScale = 'product_total_revenue_scale',
  InventoryRevenue = 'product_total_revenue',
  InventoryUnits = 'product_total_quantity',
  InventoryDaysOfStock = 'stock_level_days',
}

export type ForecastingDataType = 'actual' | 'predicted';

export type ForecastingSort = {
  direction: SortDirection;
  period: string;
  dataType: ForecastingDataType;
  metric: ForecastingMetric;
};