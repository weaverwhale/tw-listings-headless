import { NonRetryableException, heartbeat } from '@tw/temporal';
import { logger } from '@tw/utils/module/logger';

export async function myFirstActivity(params: any): Promise<any> {
  logger.info('myFirstActivity', params);
  heartbeat("I'm alive!");
  if (Math.random() < 0.5) {
    throw new Error('Retryable error');
  }
  throw new NonRetryableException('Non-retryable error');
}
