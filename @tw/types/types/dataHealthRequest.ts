import { ServicesIds } from '../services';
import { HealthCheckType } from './DataHealth';
import { Granularity } from './Granularity';

export type periodObject = { start: string; end: string };

export type dataHealthRequest = {
  shopId: string;
  serviceId?: ServicesIds;
  serviceIds?: ServicesIds[];
  accountIds?: string[];
  sendSlack?: boolean;
  softImport?: boolean;
  jobId?: string;
  jobType?: string;
  start: string;
  end: string;
  factor?: number;
  healthCheckType?: HealthCheckType;
  granularity?: Granularity;
  //for mini health check
  importSpecificDays?: boolean;
};

export type dataHealthReportsRequest = {
  shopId?: string;
  servicesId?: ServicesIds[];
  jobDate?: string;
  jobId?: string;
  reportStartDate?: string;
  reportEndDate?: string;
  isDelta?: boolean;
  from?: number;
  size?: number;
  healthCheckType?: HealthCheckType;
};

export type IntegrationDataHealthRequest = {
  serviceId: ServicesIds;
  accountId: string;
  sendSlack?: boolean;
  softImport?: boolean;
  jobId?: string;
  start: string;
  end: string;
  factor?: number;
};

export type IntegrationDataHealthReportsRequest = {
  servicesId?: ServicesIds[];
  accountId?: string;
  jobDate?: string;
  reportStartDate?: string;
  reportEndDate?: string;
  isDelta?: boolean;
  from?: number;
  size?: number;
};
