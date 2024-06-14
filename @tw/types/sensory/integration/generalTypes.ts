import { Overwrite } from '..';
import { DataHealthSetting } from '../dataHealthTypes';

export enum providerAuthMethodEnum {
  oauth = 'oauth',
  basic_auth = 'basic_auth',
}
export type ProviderAuthMethod = keyof typeof providerAuthMethodEnum;

export enum providerDomainEnum {
  sales = 'sales',
  ads = 'ads',
  sms = 'sms',
  ctv = 'ctv',
  shipping = 'shipping',
  subscription = 'subscription',
  crm = 'crm',
  content = 'content',
  reviews = 'reviews',
}
export type ProviderDomain = keyof typeof providerDomainEnum;

export enum jobDefinitionUnitEnum {
  day = 'day',
  week = 'week',
  month = 'month',
}
export type JobDefinitionUnit = keyof typeof jobDefinitionUnitEnum;

export type JobDefinitionLevel = 'full' | 'light';

export type ProviderAuth = (ProviderAuth_oAuth | ProviderAuth_basicAuth) & {
  generatedParams?: {
    param: string;
    generateUrl: string;
  }[];
};

export type ProviderAuthFields = {
  field: string;
  label?: string;
  valueType: (typeof basicAuth_valueType)[number];
  note?: string;
  validate?: {
    regex?: string;
    errorMessage?: string;
  }
};

export type ProviderAuth_oAuth = {
  url: string;
  params?: ProviderAuthFields[];
};
export type ProviderAuth_basicAuth = {
  fields: ProviderAuthFields[];
  note?: string;
};

export type ProviderSetting = {
  field: string;
  label?: string;
  settingType: (typeof providerSettings_valueType)[number];
  scope: 'fetcher' | 'nexus' | 'capi';
  values?: string[];
  defaultValue?: string | number | boolean;
  mappingFields?: collectionInfo[];
};

export type collectionInfo = {
  collectionName: string;
  fields: collectionField[];
};

export type collectionField = {
  fieldName: string;
  default?: string;
  hidden?: boolean;
}

export const basicAuth_valueType = ['string', 'number', 'boolean', 'approval', 'password'] as const;

export const providerSettings_valueType = [
  'list',
  'string',
  'number',
  'boolean',
  'dynamicMapping',
] as const;

export enum integrationStatusEnum {
  pending = 'pending', // default status for integration when created
  ready = 'ready', // ready to run after backfill is complete
  paused = 'paused', // paused by sensory system
  backfill = 'backfill', // any backfill is running
  error = 'error', // any error
  retryableError = 'retryableError', // any retryable error
  deleted = 'deleted', // deleted (also credentials are deleted)
  disconnected = 'disconnected', // disconnected but not deleted
  unknown = 'unknown',
}
export type IntegrationStatus = keyof typeof integrationStatusEnum;

export enum policyEnum {
  default = 'default',
  paidCustomer = 'paidCustomer',
  free = 'free',
  trial = 'trial',
  basic = 'basic',
}
export type Policy = keyof typeof policyEnum;

export type PolicyJobType = 'dateRange' | 'scheduleState' | 'general';
export type PolicyJobDefinition =
  | PolicyJobDefinitionGeneral
  | PolicyJobDefinitionDateRange
  | PolicyJobDefinitionState;

export type PolicyJobDefinitionBase = {
  jobType: PolicyJobType;
  level: JobDefinitionLevel;
  filterParams?: any;
};
export type PolicyJobDefinitionGeneral = Overwrite<
  PolicyJobDefinitionBase,
  {
    jobType: 'general';
    reportType?: 'snapshots' | 'incremental' | 'singleCopy';
  }
>;
export type PolicyJobDefinitionDateRange = Overwrite<
  PolicyJobDefinitionGeneral,
  {
    jobType: 'dateRange';
    unit: JobDefinitionUnit;
    count: number | null;
  }
>;

export type PolicyJobDefinitionState = Overwrite<
  PolicyJobDefinitionBase,
  {
    jobType: 'scheduleState';
    scheduleState?: { [key in string]: any }; // ['last_updated_at', 'orderId', 'filename', ...]
  }
>;

export type SensoryProviderGetAccountsParams = {
  dependent_provider_id: string;
  fields: ProviderParam[];
};

export type ProviderParam = {
  name: string;
  source: string;
};

export type PolicyAllowedFilter = {
  type: 'date' | 'string' | 'number' | 'boolean';
  field: string;
  description: string;
  maxHistoricalDays?: number;
};

export type WorkflowJobType = PolicyJobType | 'dateList';
export type ProviderAssetType = {
  id: string;
  name: string;
  description: string;
  allowedJobTypes: WorkflowJobType[];
  allowedFilters?: PolicyAllowedFilter[];
  maxHistoricalDays?: number;
  defaultLevel?: JobDefinitionLevel;
  defaultFilterParams?: any;
  defaultUnit?: JobDefinitionUnit;
  dataHealth?: DataHealthSetting;
};
