export enum ActivityType {
  CREATED = 'create',
  UPDATED = 'update',
  DELETED = 'delete',
}

export interface ActivityDiff {
  activityType: ActivityType;
  new: any;
  old: any;
  changes: any;
}

export interface ActivityMetaData {
  providerId?: string;
  providerAccount: string;
  shopDomain: string;
  level: string;
}

export interface ActivitySettings extends ActivityDiff, ActivityMetaData {
  id: string;
}
