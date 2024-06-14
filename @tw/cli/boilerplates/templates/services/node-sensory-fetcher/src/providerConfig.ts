import {
  PolicyJobDefinition,
  SensoryPolicy,
  policyEnum,
  SensoryProvider,
} from '@tw/types/module/sensory';

export const providerConfig: SensoryProvider = {
  id: $PROVIDER_ID,
  name: '',
  domain: '',
  asset_types: [],
  auth_method: '',
  auth_config: {},
  has_local_redirect_url: true,
  has_stg_redirect_url: true,
  get_accounts_params: [
    {
      name: 'shop-id',
      source: 'shopDomain',
    },
  ],
};

export const policyConfigs: SensoryPolicy<PolicyJobDefinition>[] = [
  {
    provider_id: providerConfig.id,
    policy_id: policyEnum.default,
    asset_types: [],
    schedule: 'hourly', // recurring
    job_definition: {
      jobType: 'dateRange',
      unit: 'day',
      count: 1,
      level: 'full',
    },
  },
  {
    provider_id: providerConfig.id,
    policy_id: policyEnum.default,
    asset_types: [],
    schedule: '', // backfill
    job_definition: {
      jobType: 'general',
      level: 'full',
    },
  },
];
