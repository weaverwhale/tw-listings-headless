import { IntegrationStatus, Policy, ProviderDomain } from './integration';
import { WorkflowArgs, WorkflowJobDefinition } from './workflowTypes';

/*
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name provider_id --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name integration_id --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name integration_domain --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name integration_status --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name asset_type --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name provider_account_id --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name credentials_id --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name policy_id --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name schedule --type Keyword
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster add-search-attributes --name schedule_id --type Keyword

kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name provider_id
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name integration_id
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name integration_domain
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name integration_status
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name asset_type
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name provider_account_id
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name credentials_id
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name policy_id
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name schedule
kubectl -n temporal exec deployment/temporal-admin-tools -i -- tctl admin cluster remove-search-attributes --name schedule_id
*/
export type IntegrationSearchAttributes = {
  provider_id: string[];
  integration_id: string[];
  integration_domain: ProviderDomain[];
  integration_status: IntegrationStatus[];
  asset_type: string[];
  provider_account_id: string[];
  credentials_id: string[];
  policy_id: Policy[];
  schedule: string[];
  schedule_id: string[];
};
export type IntegrationSearchAttributesKeys = keyof IntegrationSearchAttributes;

export type StartIntegrationWorkflow = (args: WorkflowArgs<WorkflowJobDefinition>) => Promise<any>;

export enum workflowExecutionStatusEnum {
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Canceled = 'Canceled',
  Terminated = 'Terminated',
  ContinuedAsNew = 'ContinuedAsNew',
  TimedOut = 'TimedOut',
}
export type WorkflowExecutionStatus = keyof typeof workflowExecutionStatusEnum;
