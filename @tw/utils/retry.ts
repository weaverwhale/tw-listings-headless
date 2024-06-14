import asyncRetry from 'async-retry';
import { logger } from './logger';

export async function retry(fn, opts?: asyncRetry.Options) {
  return await asyncRetry(
    async () => {
      return await fn();
    },
    {
      retries: 3,
      maxTimeout: 10000,
      onRetry: (e) => {
        logger.warn(`doing retry on error: ${e}`);
      },
      ...opts,
    }
  );
}
