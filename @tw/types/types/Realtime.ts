import { ServicesIds } from '../services';
import { RealtimeClientAction } from './RealtimeSubscribeMessage';

export type RealtimeEventType =
  | 'job_manager_update'
  | 'metrics_table_update'
  | 'plaid_transaction_update'
  | 'plaid_new_account_available'
  | 'attribution_update'
  | 'anomaly_alert'
  | 'shopify_update'
  | 'lighthouse_notification'
  | 'cdp_segment_update'
  | 'shopify_new_order'
  | 'activity_feed_new_activity'
  | 'willy_insights_stream'
  | 'workflow_update'
  | 'attribution_update_v2'
  | 'client-actions'


export type RealtimeEventScope =
  | ServicesIds
  | RealtimeClientAction
  | 'attribution'
  | 'anomaly'
  | 'user'
  | 'cdp'
  | 'willy'
  | 'sensory-integrations'
  | 'sensory-credentials';

export type RealtimeEvent<D = any> = {
  eventType: RealtimeEventType;
  scope: RealtimeEventScope;
  account?: string;
  data?: D;
};
