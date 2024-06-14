import type { NextFunction } from 'express';
import type { Request, Response } from '../express/getExpressApp';
import { isLocal } from '@tw/constants';
import { logger } from '../logger';
import { HttpErrorResponse } from '../express/errors';
import { addErrorMessageToDatadog } from '../datadog';

export function endpointWrapper<P = any, R = any, B = any, Q = any>(
  fn: (req: Request<P, R, B, Q>, res: Response, next?: NextFunction) => any
) {
  const wrapped = async function wrapper(
    req: Request<P, R, B, Q>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await fn(req, res, next);
      // @ts-ignore
      // isMiddleware is set in /express/middleware.ts
      // allowAutoResponse in /express/expressRoutesParser.ts
      if (!res.headersSent && !fn.isMiddleware && wrapped.allowAutoResponse) {
        logger.warn(`endpointWrapper (${fn.name || '<anonymous>'}): no response sent.`);
        if (!process.env.TW_ALLOW_AUTO_RESPONSE) return result;
        if (result) {
          return res.json(result);
        } else {
          return res.status(204).end();
        }
      }
      return result;
    } catch (e) {
      logger.error('endpointWrapper', e);
      addErrorMessageToDatadog(e);
      if (!res.headersSent) {
        // @ts-ignore
        const traceId = req.traceId;
        if (e instanceof HttpErrorResponse || isLocal) {
          return res.status(e?.status || 500).json({ message: e?.message, traceId });
        }
        return res.status(500).json({ message: 'Internal Server Error', traceId });
      } else {
        res.end();
      }
    }
  };
  return wrapped;
}
