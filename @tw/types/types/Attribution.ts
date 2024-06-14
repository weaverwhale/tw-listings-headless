import { ServicesIds } from '../services';
import { AdsSortBy } from './AdsSortBy';
import { Influencer } from './Influencers';
import { MetricsFilterExpression } from './MetricsQueryStringParams';
import { AttributionDateModels, AttributionModels } from './Pixel';
import { SortDirection } from './sortDirection';

export type AttributionGroups = 'campaign_id' | 'adset_id' | 'ad_id';

interface BaseAttributionRequest {
  start: string;
  end: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  page: number;
  pixel_attribution_model: string;
  pixel_date_model: string;
  shopDomain: string;
  group_by: AttributionGroups;
  sort_by?: AdsSortBy;
  sort_direction?: SortDirection;
}

export type AttributionAdRequest = {
  service_id: string;
  account_ids: string[];
  campaign_id?: string;
  adset_id?: string;
} & BaseAttributionRequest;

export type AttributionInfluencerRequest = {
  campaign_id?: string;
  isSummary?: boolean;
} & BaseAttributionRequest;

export interface AttributionMetricsBreakdown {
  date: string;
  metrics: AttributionMetrics;
}

export interface AttributionMetrics {
  spend: number;
  conversionValue: number;
  pixelConversionValue: number;
  pixelPurchases: number;
  pixelNcPurchases: number;
  pixelNcConversionValue: number;
  pixelCpa: number;
  pixelNcCpa: number;
  pixelNcAov: number;
  purchases: number;
  clicks: number;
  impressions: number;
  roas: number;
  pixelRoas: number;
  cpc: number;
  ctr: number;
  cpm: number;
  cpa: number;
  aov: number;
}

export type AttributionResponse = {
  metricsBreakdown: AttributionMetricsBreakdown[];
  id: string;
  name: string;
  metrics: AttributionMetrics;
};

export type InfluencerAttributionResponse = Influencer & AttributionResponse;

export type RealTimeAttributionPayload = {
  orderId: number;
  totalPrice: number;
  cogs: number;
  eventDate: string;
  model: ModelNames;
} & AttributionData;

export type LinearModelNames = 'linear' | 'fullLinear' | 'linearAll' | 'linear-v2' | 'linearAll-v2';
export type ModelNames =
  | 'lastClick'
  | 'fullLastClick'
  | 'lastPlatformClick'
  | 'firstClick'
  | 'fullFirstClick'
  | 'every'
  | 'markov'
  | 'shapley'
  | 'fullLastClick-v2'
  | 'fullFirstClick-v2'
  | 'lastPlatformClick-v2'
  | LinearModelNames;

export type AttributionData = {
  source: string;
  accountId?: string;
  campaignId: string;
  adsetId?: string;
  adId?: string;
};

export type AttributionObj = {
  ids: AttributionData;
  modelName: ModelNames;
  clickDate: string;
  linearWeight?: number;
};

export type AttributionBreakdown = 'source' | 'campaignId' | 'adsetId' | 'adId';

type AttributionFilter = { key: 'campaignId' | 'adsetId' | 'adId'; value: string | string[] };
export interface StatRequest {
  shopDomain: string;
  model: AttributionModels;
  startDate: string;
  endDate: string;
  dateModel: AttributionDateModels;
  sources?: ServicesIds[];
  breakdown: AttributionBreakdown;
  filters?: Record<ServicesIds, MetricsFilterExpression[][]>;
  accountIds: Record<ServicesIds, string[]>;
  currency: string;
  // should be removed
  attributionFilterKey?: 'campaignId' | 'adsetId';
  attributionFilterValue?: string;
  attributionFilters?: AttributionFilter[];
  timezone?: string;
  includeOneDayFacebookView: boolean;
  shopCurrency?: string;
  granularity?: 'day' | 'hour' | 'month' | 'week';
  attributionWindow?: 14 | 7 | 28 | 1 | 'lifetime';
  showDirect?: boolean;
  includePpsViews?: boolean;
  parentPixelPurchases?: number;
  parentPixelConversionValue?: number;
  useNexus?: boolean;
}
