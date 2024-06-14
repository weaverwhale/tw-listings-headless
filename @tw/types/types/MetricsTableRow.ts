import { MetricsTableData } from './MetricsTableData';

export declare type MetricsTableRow = {
  channelId: string; // serviceId.dataType
  accountId: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  currency?: string;
  date: string;
  hour: string;
  slot: number;
  adType?: number; //for youtube
  data: MetricsTableData;
};

export type MetricsTableDayRow = Omit<MetricsTableRow, 'hour'>;
