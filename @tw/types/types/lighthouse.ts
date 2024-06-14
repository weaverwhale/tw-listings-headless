export const lighthouseNotificationType = [
  'anomaly',
  'rule',
  'generative',
  'timing',
  'cdp-audience',
  'rules-report',
  'inventory',
  'metrics-report',
  'data-stories',
  'opportunity-report',
  'klaviyo',
] as const;

export type LighthouseNotificationTypes = (typeof lighthouseNotificationType)[number];

export type LighthouseNotification<D = any> = {
  id: string;
  docId?: string;
  type: LighthouseNotificationTypes;
  startDate: Date;
  endDate: Date;
  shop: string;
  user: string;
  read?: boolean;
  archived?: boolean;
  serviceId: string;
  timeToLive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  data: D;
  subtopic?: string;
  email?: string;
};
