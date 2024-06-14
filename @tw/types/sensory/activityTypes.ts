import { ReportMetaData } from './endpointTypes';
import { JobDefinitionLevel } from './integration';

export type ReportImportType = 'recurring' | 'backfill';
export type ReportType = 'snapshots' | 'incremental' | 'singleCopy';
export type ActivityJobDefinition<T extends Filter> = {
  fetchDate: string;
  level: JobDefinitionLevel;
  integrationId: string;
  assetType: string;
  filter: T;
  reportType: ReportType;
  reportProcTimestamp: number;
  importType: ReportImportType;
  currentIndex?: number;
  total?: number;
};

export type Filter = ActivityDateRangeFilter | ActivityStateFilter | ActivityGeneralFilter;

export type ActivityFilterBase = {
  filterParams?: any;
};
export type ActivityGeneralFilter = ActivityFilterBase & {
  workflowState?: object | null;
};

export type ActivityStateFilter = ActivityGeneralFilter & {
  scheduleState?: object | null;
};

export type ActivityDateRangeFilter = ActivityFilterBase & {
  start: string;
  end: string;
};

export type ActivityMetadata = {
  report_meta_data: ReportMetaData;
  file_path: string;
  file_size_bytes: number;
  records_count: number;
};
