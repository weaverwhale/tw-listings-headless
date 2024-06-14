import { ActivityJobDefinition, Filter } from './activityTypes';
import { WorkflowArgs, WorkflowJobDefinition } from './workflowTypes';

export type ProviderAccount = {
  provider_id: string;
  provider_account_id: string;
  provider_account_name: string;
  timezone: string;
  currency: string;
  extra_params?: object;
};
export type FetcherIntegrationDetails = Pick<
  WorkflowArgs<WorkflowJobDefinition>,
  | 'providerId'
  | 'providerAccountId'
  | 'providerAccountName'
  | 'currency'
  | 'timezone'
  | 'integrationId'
  | 'customArgs'
  | 'credentialsId'
  | 'scheduleId'
  | 'settings'
  | 'tw_account_id'
>;

export type FetcherParams = {
  jobDefinition: ActivityJobDefinition<Filter>;
  integrationDetails: FetcherIntegrationDetails;
};
