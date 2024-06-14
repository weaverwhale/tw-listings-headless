export interface ShopProviderState {
  integrations: { [key in string]?: ShopIntegrationState };
  error?: {
    errorMessage: string;
    createdAt: Date;
  };
}

export interface ShopIntegrationState {
  status?: ShopIntegrationStatusEnum;
  error?: {
    errorMessage: string;
    createdAt: Date;
  };
}

export interface ShopIntegrationProperties {
  currency?: string;
  id: string;
  integrationId?: string;
  providerAccount: string;
  name?: string;
  status?: ShopIntegrationStatusEnum;
  errorMessage?: string;
  end_advertiser?: string;
  timezone?: string;
  settings?: any;
}

export interface ShopProviderStatus {
  status?: ShopProviderStatusEnum;
  errorMessage?: string;
}

export enum ShopProviderStatusEnum {
  pending = 'pending',
  disconnected = 'disconnected',
  connected = 'connected',
  backfill = 'backfill',
}

export enum ShopIntegrationStatusEnum {
  pending = 'pending',
  ready = 'ready',
  paused = 'paused',
  backfill = 'backfill',
  error = 'error',
  retryableError = 'retryableError',
  deleted = 'deleted',
  disconnected = 'disconnected',
  unknown = 'unknown',
}
