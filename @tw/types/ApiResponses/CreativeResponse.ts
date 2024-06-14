import { AttributeStatus, CreativeTypes } from '../types';
import { HighlightMetrics } from '../types/CreativesRequest';
import { AllMetricsAndPixelMetricsKeys } from '../types/Metrics';
import { MetricsBreakdown } from './MetricsResponse';

export interface CreativeResponse {
  creatives: Creative[];
  averages: any;
  maximums: any;
  error?:boolean;
}

export interface Creative {
  id: string;
  comparisons?: any;
  metricsBreakdown: MetricsBreakdown[];
  metrics: AllMetricsAndPixelMetricsKeys;
  assetType: CreativeTypes;
  thumbnail: string;
  image: string;
  body: string;
  status: AttributeStatus;
  name: string;
  numberOfAds: number;
  account_id: string;
  campaignName: string;
  adsetName: string;
  product_id: string;
  images?: any[];
  handle?: string;
  productUrl?: string;
}

export type HighlightCreative = {
  id: string;
  assetType: CreativeTypes;
  name: string;
  metric: HighlightMetrics;
  thumbnail?: string;
  image?: string;
  body?: string;
  value: number;
  prevValue: number;
  delta: number;
};

export type CreativeSegment = {
  id: string;
  metrics: AllMetricsAndPixelMetricsKeys;
  metricsBreakdown: MetricsBreakdown[];
  numberOfAds: number;
  thumbnails: string[];
  segmentTitle: string;
  segmentDescription: string;
};

export type CreativeHighlightsResponse = {
  creatives: HighlightCreative[];
};

export type CreativeSegmentsResponse = {
  segments: CreativeSegment[];
};
