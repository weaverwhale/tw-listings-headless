import {
  IntegrationStatus,
  PolicyJobDefinition,
  ProviderAssetType,
  ProviderAuth,
  ProviderAuthMethod,
  ProviderDomain,
  ProviderSetting,
  SensoryProviderGetAccountsParams,
  policyEnum,
} from './generalTypes';

export interface BaseTableProps {
  created_at?: string;
  updated_at?: string;
}
export interface credential extends BaseTableProps {
  id: string;
  provider_id: string;
  credentials: object;
  allowed_scopes: string[];
  deleted_at: string;
}
export interface SensoryProvider extends BaseTableProps {
  id: string;
  name: string;
  domain: ProviderDomain;
  asset_types: ProviderAssetType[];
  auth_method: ProviderAuthMethod;
  auth_config: ProviderAuth;
  has_local_redirect_url: boolean;
  has_stg_redirect_url: boolean;
  is_disconnect_required?: boolean;
  get_accounts_params?: SensoryProviderGetAccountsParams[];
  has_webhook?: boolean;
  has_approval_flow?: boolean;
  settings?: ProviderSetting[];
  capi_settings?: ProviderSetting[];
  is_paused?: boolean;
}
export type Schedule = number | string; // if number, if hourly the each hour with offset, if string = cron expression
export interface SensoryPolicy<T extends PolicyJobDefinition> extends BaseTableProps {
  provider_id: string;
  policy_id: policyEnum;
  asset_types: string[];
  schedule: Schedule;
  job_definition: T;
}
export interface SensoryIntegration extends BaseTableProps {
  id?: string;
  provider_id: string;
  policy_id: string;
  provider_account_id: string;
  provider_account_name: string;
  credentials_id: string;
  active?: boolean;
  status?: IntegrationStatus;
  currency?: string;
  timezone?: string;
  extra_params?: object;
  settings?: object[];
  capi_settings?: object[];
  filters?: object;
  deleted_at?: string;
  tw_account_id?: string; // Will be required in the future (for backward compatibility, it is optional for now)
}

export interface WorkflowStatus extends BaseTableProps {
  workflow_id: string;
  integration_id: string;
  asset_type: string;
  total?: number;
  current_index?: number;
  done_date?: string;
  activity_job_definition?: object;
  integration_details?: object;
  report_meta_data?: object;
  status?: string;
  errors?: object;
}

export interface integration_db {
  credential: credential;
  provider: SensoryProvider;
  policy: SensoryPolicy<PolicyJobDefinition>;
  integration: SensoryIntegration;
  workflow_status: WorkflowStatus;
}
