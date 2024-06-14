import { createHook } from 'async_hooks';
import { tracer } from '../datadog';
import { logger } from '../logger';
import os from 'os';

export function eventLoopMonitor(thresholdMs: number = 100) {
  const cache = new Map<number, [number, number]>();
  function before(asyncId: number) {
    cache.set(asyncId, process.hrtime());
  }

  function after(asyncId: number) {
    const cached = cache.get(asyncId);
    if (cached == null) {
      return;
    }
    cache.delete(asyncId);

    const ms = process.hrtime(cached)[0];
    if (ms > thresholdMs) {
      logger.warn(`Event loop was blocked for ${ms}ms`);

      if (tracer) {
        const span = tracer.startSpan('EventLoopBlock', {
          childOf: tracer.scope().active(),
          startTime: new Date().getTime() - ms,
          tags: {
            hostname: os.hostname(),
          },
        });
        span.finish();
      }
    }
  }

  const asyncHook = createHook({ before, after });

  asyncHook.enable();
  return asyncHook;
}
