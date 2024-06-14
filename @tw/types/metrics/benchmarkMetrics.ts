import { SummaryMetricsChartsSelectorsNames } from '../SummaryMetrics';
import { ServicesIds } from '../services';
import { MetricData, MetricsKeys } from "./metrics";

export type Provider = "facebook-ads" | "google-ads" | "tiktok-ads" | "triple-whale";

export type MetricSelector =
  | 'totalShopCount'
  | 'totalBenchmarksCPC'
  | 'totalBenchmarksCTR'
  | 'benchmarksFacebookRoas'
  | 'totalBenchmarksFBAdsSpendAvg'
  | 'totalBenchmarksCTRGoogle'
  | 'totalBenchmarksCPCGoogle'
  | 'benchmarksGoogleRoas'
  | 'totalBenchmarksGoogleAdsSpendAvg'
  | 'totalBenchmarksCTRTiktok'
  | 'totalBenchmarksCPCTiktok'
  | 'benchmarksTiktokRoas'
  | 'totalBenchmarksTiktokAdsSpendAvg'
  | 'totalBenchmarksBlendedCTR'
  | 'totalBenchmarksBlendedROAS'
  | 'totalBenchmarksBlendedSpendAvg'
  | 'totalBenchmarksBlendedCpc'
  | 'blendedCpaBenchmarksTotal'
  | 'blendedCpcBenchmarksTotal'
  | 'blendedCpmBenchmarksTotal'
  | 'blendedRoasBenchmarksTotal'
  | 'facebookCpaBenchmarksTotal'
  | 'facebookCpcBenchmarksTotal'
  | 'facebookCpmBenchmarksTotal'
  | 'facebookRoasBenchmarksTotal'
  | 'googleCpaBenchmarksTotal'
  | 'googleCpcBenchmarksTotal'
  | 'googleCpmBenchmarksTotal'
  | 'googleRoasBenchmarksTotal'
  | 'tiktokCpaBenchmarksTotal'
  | 'tiktokCpcBenchmarksTotal'
  | 'tiktokCpmBenchmarksTotal'
  | 'tiktokRoasBenchmarksTotal'
   ;


export type MetricChart =
  | 'chartBenchmarksCPC'
  | 'chartBenchmarksCTR'
  | 'chartBenchmarksFacebookRoas'
  | 'chartBenchmarksFBAdsSpendAvg'
  | 'chartBenchmarksCPCGoogle'
  | 'chartBenchmarksCTRGoogle'
  | 'chartBenchmarksGoogleRoas'
  | 'chartBenchmarksGoogleAdsSpendAvg'
  | 'chartBenchmarksCPCTiktok'
  | 'chartBenchmarksCTRTiktok'
  | 'chartBenchmarksTiktokRoas'
  | 'chartBenchmarksTiktokAdsSpendAvg'
  | 'chartBenchmarksBlendedCTR'
  | 'chartBenchmarksBlendedROAS'
  | 'chartBenchmarksTotalPriceUSDAvg'
  | 'chartBenchmarksBlendedCpc'
  | 'chartFacebookInsights'
  | 'chartFacebookPurchaseRoas'
  | 'chartFacebookCpc'
  | 'chartFacebookCtr'
  | 'totalGoogleAdsCtrChart'
  | 'googleCpcChart'
  | 'googleAdsRoasChart'
  | 'chartGoogleAds'
  | 'chartTiktokCtr'
  | 'chartTiktokCpc'
  | 'tiktokRoasChart'
  | 'tiktokSpendChart'
  | 'blendedCpaBenchmarksChart'
  | 'blendedCpcBenchmarksChart'
  | 'blendedCpmBenchmarksChart'
  | 'blendedRoasBenchmarksChart'
  | 'facebookCpaBenchmarksChart'
  | 'facebookCpcBenchmarksChart'
  | 'facebookCpmBenchmarksChart'
  | 'facebookRoasBenchmarksChart'
  | 'googleCpaBenchmarksChart'
  | 'googleCpcBenchmarksChart'
  | 'googleCpmBenchmarksChart'
  | 'googleRoasBenchmarksChart'
  | 'tiktokCpaBenchmarksChart'
  | 'tiktokCpcBenchmarksChart'
  | 'tiktokCpmBenchmarksChart'
  | 'tiktokRoasBenchmarksChart';


  export type MetricsWithSelector<M extends MetricsKeys> = {
    selector: MetricSelector;
    chart: MetricChart;
    provider: Provider;
    tip: string
    color?: string;
    userSelector?: string;
    userChart?: SummaryMetricsChartsSelectorsNames;
  } & MetricData<M>;
  
  export type MetricsDictionaryWithSelector = {
    [provider in ServicesIds]?: {
      [metric in MetricsKeys]?: MetricsWithSelector<metric>;
    };
  };