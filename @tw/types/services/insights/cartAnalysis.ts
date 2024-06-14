import { FilterProperty } from './filters/FilterProperty';
import { InsightsFilterQuery } from './filters/InsightFilter';

export type BoughtTogetherParams = {
  shopId: string;
  startDate: string;
  endDate: string;
  minNumberOfProducts: number;
  includeFreeProducts: boolean;
  viewBy:
    | FilterProperty.PRODUCT_ID
    | FilterProperty.PRODUCT_SKU
    | FilterProperty.PRODUCT_VARIANT_ID;
  filters?: InsightsFilterQuery[];
  CDPSegmentId?: string;
  sortBy: BoughtTogetherMetric;
  sortDirection: 'asc' | 'desc';
  limit: number;
};

export enum BoughtTogetherMetric {
  AOV = 'AOV',
  TOTAL_ORDERS = 'totalOrders',
  TOTAL_SALES = 'totalSales',
  ORDERS_PERCENTAGE = 'ordersPercentage',
  NEW_ORDERS = 'newOrders',
  NEW_SALES = 'newSales',
  RETURNING_ORDERS = 'returningOrders',
  RETURNING_SALES = 'returningSales',
}

export type BoughtTogetherProduct = {
  prodcutId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  sku?: string;
  imgSrc: string;
  productTotalOrders: number;
  productBundlesPercentage: number;
};

export type BoughtTogetherGroup = {
  key: string;
  metrics: { [key in BoughtTogetherMetric]: number };
  products: BoughtTogetherProduct[];
};

export type BoughtTogetherData = BoughtTogetherGroup[];
