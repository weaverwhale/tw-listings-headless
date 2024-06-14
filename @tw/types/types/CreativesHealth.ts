
import { MetricsQueryStringParams } from './MetricsQueryStringParams';
export type InternalAccountData = {
  clicks: number,
  spend: number,
  impressions: number,
  purchases: number,
  conversionValue: number,
  outboundClicks?:number
};

export declare type MetricsHelathQueryStringParams = {
  creativeCockpitEnabled:boolean;
} & MetricsQueryStringParams