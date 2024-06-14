import { isLocal, isStaging } from '@tw/constants';
import { trackEvent } from '../analytics';
import { notificationEvents } from '@tw/constants/module/notifications';

export async function trackNotificationEvent(
  action: keyof typeof notificationEvents,
  userId: string,
  shopId: string,
  notificationId: string,
  platform: string,
  topic: string,
  subtopic: string
): Promise<void> {
  trackEvent(
    'notifications',
    {
      userId,
      shopId,
      action: notificationEvents[action],
      notificationId,
      platform,
      topic,
      subtopic,
    },
    {
      skipPosthog: false,
      log: isLocal || isStaging,
    }
  );
}
