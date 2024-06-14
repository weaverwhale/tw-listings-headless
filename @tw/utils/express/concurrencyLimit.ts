import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';

const IGNORE = 'CURRENT_IGNORE';

export function concurrencyLimit(limit: number, mode: 'queue' | 'throttle' = 'throttle') {
  let current = 0;
  const queue: { req: Request; res: Response; next: NextFunction }[] = [];
  function finishReq() {
    current--;
    if (mode === 'queue' && queue.length) {
      queue.shift().next();
    }
  }
  function handleConcurrencyLimit(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      if (mode === 'throttle' && res[IGNORE]) {
        return;
      }
      finishReq();
    });

    if (current < limit) {
      current++;
      return next();
    }
    if (mode === 'throttle') {
      logger.debug(`concurrencyLimit throttling req, ${current} ${limit}`);
      res[IGNORE] = true;
      return res.status(429).send('Reached max current.');
    }
    if (mode === 'queue') {
      logger.debug(`concurrencyLimit queuing req, ${current} ${limit}`);
      queue.push({ req, res, next });
    }
  }
  return handleConcurrencyLimit;
}
