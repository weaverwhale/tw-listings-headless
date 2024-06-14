import { LighthouseNotification } from '@tw/types/module/types/lighthouse';

export function getNotificationSubtopic(notification: LighthouseNotification) {
  if (notification.subtopic) {
    return notification.subtopic;
  }
  switch (notification.type) {
    case 'generative':
      return 'ads';
    case 'inventory':
      return notification?.data?.type;
    case 'anomaly':
      return notification?.data?.metric;
    case 'cdp-audience':
      return notification?.data?.eventType;
    case 'data-stories':
      return 'data-stories';
    case 'metrics-report':
      return 'total_impact';
    case 'opportunity-report':
      return 'opportunity-report';
    case 'rule':
      return 'facebook-ads';
    case 'rules-report':
      return 'facebook';
    case 'klaviyo':
      return 'campaign_sent';
    case 'data-stories':
      return 'data-stories';
  }
  return;
}

export function notificationDefaultSettingOn(topic: string, subtopic: string) {
  if (topic === 'activities') {
    if (['shopify_product_in_stock', 'shopify_product_out_of_stock'].includes(subtopic)) {
      return false;
    }
    return true;
  }
  return true;
}
