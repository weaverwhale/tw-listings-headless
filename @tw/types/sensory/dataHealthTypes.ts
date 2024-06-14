import { DataTypesIds } from '../services/general';
import { MetricsKeys } from '../types';

export type DataHealthParams = {
  integrationId: string;
  assetType: string;
  start: string;
  end: string;
};

export type DataHealthResponse = {
  fieldsComparison: DataHealthFieldsDiff;
  integrationId: string;
  assetType?: string;
  providerId: string;
  currency: string;
  startDate: string;
  endDate: string;
  status: HealthCheckStatus;
};

export type DataHealthSetting = {
  fields: DataHealthSettingFields;
};

export type DataHealthSettingFields = {
  [key in MetricsKeys]?: {
    isCritical?: boolean;
    factor?: number;
    minDelta?: number;
  };
};

export type DataHealthFieldsDiff = {
  [Property in MetricsKeys]?: {
    internal: number;
    external: number;
    delta: number;
    status: HealthCheckStatus;
  };
};

export enum HealthCheckStatus {
  OK = 'ok',
  WARNING = 'warning',
  ERROR = 'error',
}

export type MetricsHealthQueryParams = {
  start: string;
  end: string;
  integrationIds?: string[];
  metrics: string[];
};
