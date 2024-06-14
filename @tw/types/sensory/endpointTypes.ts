import { ActivityJobDefinition, ActivityStateFilter, Filter } from './activityTypes';
import { FetcherIntegrationDetails, FetcherParams, ProviderAccount } from './fetcherTypes';
import { DataHealthParams } from './dataHealthTypes';
import { SensoryProviderGetAccountsParams } from './integration';
import { RawMetrics } from '../types';

export type AuthFunc = ({}: AuthParams) => Promise<any>;
export type DisconnectFunc = ({}: DisconnectParams) => Promise<any>;
export type AccountsFunc = ({}: GetAccountParams) => Promise<ProviderAccount[]>;
export type GetDefaultBackfillRangeCountFunc =
  ({}: GetDefaultBackfillRangeCount) => Promise<number>;
export type GetDynamicFieldValueFunc = ({}: GetDynamicFieldValueParams) => Promise<DynamicFieldValue[]>;
export type GetDataFunc = ({}: GetDataParams) => Promise<ReportData>;
export type HandleIncomingWebhookFunc = ({}: any) => Promise<any>;
export type ValidateCredentials =
  ({}: ValidateCredentialsParams) => Promise<ValidateCredentialsResponse>;
export type dataHealthFunc = ({}: DataHealthParams) => Promise<RawMetrics>;

export type CreateSegmentFunc = ({}: CreateSegmentParams) => Promise<{ segmentId: string }>;
export type UpdateSegmentFunc = ({}: UpdateListParams) => Promise<{ success: boolean; deleted: number; added: number; }>;

export type WebhookFuncs = {
  get?: ({}: WebhooksDefaultRequestParams) => Promise<any>;
  post: ({}: WebhooksPostParams) => Promise<boolean>;
  delete: ({}: WebhooksDefaultRequestParams) => Promise<boolean>;
};

export type WebhooksDefaultRequestParams = {
  integrationId: string;
};

export type WebhooksPostParams = WebhooksDefaultRequestParams & {
  assetTypes?: string[];
  topics?: string[];
};

export type GetAccountParams = {
  credentialsId: string;
  params?: object;
};

export type AuthParams = {
  redirectUri: string;
  query: any;
  stateObj?: any;
};

export type DisconnectParams = {
  credentialsId: string;
};

export type GetDefaultBackfillRangeCount = {
  credentialsId: string;
  providerAccountId: string;
  assetType: string;
};

export type GetDynamicFieldValueParams = {
  collectionName: string;
  credentialsId: string;
};

export type ReportMsp = {
  provider: string;
  id: string;
};

export type ReportGranularity = 'hourly' | 'daily' | 'monthly' | 'yearly';
export type ReportMetaDataRequired = {
  timezone: string;
  currency: string;
  granularity?: ReportGranularity;
  msp?: ReportMsp;
  fetcherSchemaVersion: `${number}.${number}`; //allowing only major and minor and patch version x.x.x Or x.x
};

export type ReportCustomMetaData = Partial<ActivityStateFilter> & {
  [key: string]: any;
};

export type StorageCustomSettings = {
  fileName: string;
};

export type ReportMetaData = ReportMetaDataRequired & {
  customMetaData?: ReportCustomMetaData;
  storageCustomSettings?: StorageCustomSettings;
};
export type ReportData = {
  report: Array<any>;
  reportMetaData: ReportMetaData;
};

export type GetDataParams = FetcherParams;

export type ValidateCredentialsParams = {
  credentials: object;
};
export type ValidateCredentialsResponse = {
  isValid: boolean;
  credentials: object;
  errorMessage?: string;
};

export type DynamicFieldValue = {
  id: string;
  label?: string;
  description?: string;
};

// Segments
export type SegmentCustomer = {
  email?: string;
  phone?: string ;
};
export type CreateSegmentParams = {
  credentialsId: string;
  shopId: string;
  segmentName: string;
}
export type UpdateListParams = {
  credentialsId: string;
  shopId: string;
  segmentId: string;
  newCustomers: SegmentCustomer[];
}
