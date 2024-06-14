import { ActivityJobDefinition, Filter, Overwrite } from '.';
import {
  IntegrationStatus,
  PolicyJobDefinitionBase,
  PolicyJobDefinitionDateRange,
  PolicyJobDefinitionGeneral,
  PolicyJobDefinitionState,
  integrationStatusEnum,
} from './integration';

export type WorkflowArgs<T extends WorkflowJobDefinition> = {
  providerId: string;
  integrationId: string;
  providerAccountId: string;
  currency: string;
  timezone: string;
  jobDefinition: T;
  credentialsId: string;
  providerAccountName: string;
  assetType: string;
  scheduleId?: string;
  customArgs?: object;
  settings?: object[];
  tw_account_id?: string;
};

export type WorkflowJobDefinition =
  | WorkflowJobDefinitionGeneral
  | WorkflowJobDefinitionDateRange
  | WorkflowJobDefinitionDateList
  | WorkflowJobDefinitionState;

export type WorkflowJobDefinitionGeneral = PolicyJobDefinitionGeneral;

export type WorkflowJobDefinitionDateList = Overwrite<
  PolicyJobDefinitionBase,
  {
    jobType: 'dateList';
    dates: [string, ...string[]];
  }
>;

export type WorkflowJobDefinitionDateRange = Overwrite<
  PolicyJobDefinitionDateRange,
  {
    count: number;
    endDate?: string;
  }
>;

export type WorkflowJobDefinitionState = PolicyJobDefinitionState;

export type WorkflowStatusPayload = {
  workflowId: string;
  integrationId?: string;
  assetType?: string;
  total?: number;
  currentIndex?: number;
  activityJobDefinition?: any;
  integrationDetails?: any;
  workflowMetadata?: any;
  errors?: any;
  status?: 'running' | 'completed' | 'terminated' | 'completedWithError';
  doneDate?: string;
};

export type WorkflowIntegrationStatus =
  | Omit<
      WorkflowStatusPayload,
      'activityJobDefinition' | 'integrationDetails' | 'workflowMetadata'
    > & { integrationStatus?: IntegrationStatus };
