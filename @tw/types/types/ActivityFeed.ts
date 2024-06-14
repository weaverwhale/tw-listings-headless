import { ServicesIds } from '../services';

export type Activity = {
  id: string;
  activityKey?: string;
  type: ActivityType;
  date: Date;
  shopId: string;
  annotation: boolean;
  serviceId: ServicesIds;
  entity?: ActivityEntity;
  accountId?: string;
  entityId?: string;
  entityName?: string;
  field?: ActivityField;
  from?: any;
  to?: any;
  title?: string;
  description?: string;
  source?: string;
  author?: string;
};

export type ActivityType = 'create' | 'update' | 'delete' | 'sent';

export type ActivityEntity =
  | 'order'
  | 'product'
  | 'variant'
  | 'collection'
  | 'theme'
  | 'campaign'
  | 'adset'
  | 'ad'
  | 'cdp_segment'
  | 'sms_flow'
  | 'email_flow'
  | 'post_purchase_survey'
  | 'integration'
  | 'new_user'
  | 'media';

export type ActivityField =
  | 'status'
  | 'name'
  | 'daily_budget'
  | 'sync_to_facebook'
  | 'sync_to_klaviyo'
  | 'lifetime_budget'
  | 'bid_amount'
  | 'inStock'
  | 'price';
