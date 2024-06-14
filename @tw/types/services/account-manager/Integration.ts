import { ServicesIds } from '../general';
import { WorkflowIntegrationStatus } from '../../sensory';
import { ShopIntegrationStatusEnum } from '../../types/ShopProviders';

export interface Integration {
  id: string;
  name: string;
  version: number;
  status: ShopIntegrationStatusEnum;
  extra_params: { currency?: string; timezone?: string } & object;
  provider_id: ServicesIds;
  provider_account: string;
  tw_account_id: string;
  credentials_id: string;
  settings: object;
  workflowStatus: WorkflowIntegrationStatus[];
  errorMessage?: string;
}
