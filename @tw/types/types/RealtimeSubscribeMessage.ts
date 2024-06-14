import { ServicesIds } from '../services';
import { sensoryCredentialService, sensoryIntegrationService, sensoryMaster } from '../auth';

export const clientActions = ['force-refresh'] as const;
export type RealtimeChannel =
  | `${ServicesIds | typeof sensoryIntegrationService | typeof sensoryCredentialService}:${string}`
  | typeof sensoryMaster;
export type RealtimeClientAction = (typeof clientActions)[number];

export declare type RealtimeSubscribeMessage = {
  channel: RealtimeChannel;
  shopId: string;
};

export declare type ClientActionsRealtimeSubscribeMessage = {
  action: RealtimeClientAction;
  shopId: string;
  date: string;
};
