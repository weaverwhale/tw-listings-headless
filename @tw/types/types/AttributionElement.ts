import { MetricsBreakdown } from '../ApiResponses/MetricsResponse';
import { ServicesIds } from '../services';
import { AttributeStatus } from './AnalyticsAttributes';
import { AllMetricsAndPixelMetricsKeys } from './Metrics';
import { Entity } from './MetricsEntity';

export type UnknownSource = string;

export declare type AttributionElement = {
  id: string;
  name: string;
  status: AttributeStatus;
  metricsBreakdown: MetricsBreakdown[];
  metrics: AllMetricsAndPixelMetricsKeys;
  type: Entity;
  image?: string;

  source: ServicesIds | UnknownSource;

  accountId?: string;

  campaignId?: string;
  campaignName?: string;

  adsetId?: string;
  adsetName?: string;

  adId?: string;
  adName: string;

  sourceMatch?: boolean;
  campaignMatch?: boolean;
  adsetMatch?: boolean;
  adMatch?: boolean;
};
