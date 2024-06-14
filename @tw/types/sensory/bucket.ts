import { ActivityJobDefinition, Filter, ReportImportType, ReportType } from './activityTypes';
import { ReportGranularity, ReportMetaData, ReportMsp } from './endpointTypes';
import { FetcherIntegrationDetails } from './fetcherTypes';

export type SaveReportToBucketArgs = {
  report: any;
  reportMetaData: ReportMetaData & {
    jobDefinition: ActivityJobDefinition<Filter>;
    integration: FetcherIntegrationDetails;
    workflowId: string;
  };
};

export type SaveReportToBucketMetadata = {
  sensoryVersion: string;
  reportVersion: string;
  providerId: string;
  integrationId: string;
  providerAccountId: string;
  dataType: string; // To maintain compatibility with old versions, you need to delete in the future
  assetType: string;
  procTs: string;
  eventDate?: string;
  startEventDate?: string;
  endEventDate?: string;
  timezone: string;
  currency: string;
  granularity?: ReportGranularity;
  workflowId: string;
  importType: ReportImportType;
  reportType: ReportType;
  msp?: ReportMsp;
  tw_account_id?: string;
};
