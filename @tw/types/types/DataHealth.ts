import { ServicesIds } from '../services';
import { MetricsTableData } from './MetricsTableData';

export type DataHealthReport = {
  [Property in keyof MetricsTableData]: {
    internal: number;
    external: number;
    delta: number;
  };
};

export type DataHealthFullReport = {
  fieldsComparison: DataHealthReport;
  shopId: string;
  serviceId: ServicesIds;
  accountId: string;
  currency: string;
  jobDate: string;
  jobId?: string;
  reportStartDate: string;
  reportEndDate: string;
  isDeltaError?: boolean;
};

export type DataHealthFullReportRow = {
  shouldBeReported?: boolean;
  healthCheckType?: HealthCheckType;
} & DataHealthFullReport;

export type DataHealthField = keyof MetricsTableData;

export type DateHealthFieldsConf = {
  [key in DataHealthField]?: {
    isCritical?: boolean;
    factor?: number;
    minDelta?: number;
    label?: string;
  };
};

export type DataHealthConf = {
  isSerialPeriodsChecks?: boolean;
  fields: DateHealthFieldsConf;
};

export type IntegrationDataHealthFullReport = {
  fieldsComparison: DataHealthReport;
  serviceId: ServicesIds;
  accountId: string;
  currency: string;
  jobDate: string;
  reportStartDate: string;
  reportEndDate: string;
  isDeltaError?: boolean;
};

export enum HealthCheckType {
  AdsMetrics = 'AdsMetrics',
  NexusAdsMetrics = 'NexusAdsMetrics',
  BigTableVsNexus = 'BigTableVsNexus',
}
