import { NextFunction, Request, RequestHandler, Response } from 'express';
import { logger } from '../logger';
import { deny } from '../auth';
import { endpointWrapper } from '../api';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { FeatureFlag, FeatureFlagResultProperties } from '@tw/feature-flag-system/module/types';
import moment from 'moment-timezone';

type DateRangeLimitData = { start: string; shopId: string };

export function featureFlagMiddleware<B = any, P = any, Q = any, R = any>(args: {
  dateRange: (req: Request<P, R, B, Q>) => DateRangeLimitData;
}): RequestHandler<P, R, B, Q> {
  const { dateRange } = args;

  async function validateDateRange(req: Request<P, R, B, Q>, res: Response, next: NextFunction) {

    if (!(req as any).user) {
      return next();
    }

    if (dateRange) {
      const { start, shopId } = dateRange(req);
      if (start && shopId) {
        try {
          const { data } = await callServiceEndpoint<FeatureFlagResultProperties>(
            'subscription-manager',
            `features/feature-flag-config/${shopId}/${FeatureFlag.LIMIT_LOOKBACK_FF}`,
            null,
            { method: 'GET' }
          );

          const { numericLimit: limitInMonth } = data ?? {};


          if (limitInMonth) {
            try {
              const momentStart = moment(start);
              const earliestDate = moment().subtract(limitInMonth, 'month').startOf('day');
              if (momentStart?.isBefore(earliestDate)) {
                logger.warn(
                  `featureFlagValidation LIMIT_LOOKBACK_FF deny: ${earliestDate.format()} < ${momentStart.format()}`
                );
                return deny(res, {
                  message: 'Date range exceeds plan limitation',
                  result: false,
                });
              }
            } catch (e) {
              logger.error(`featureFlagValidation LIMIT_LOOKBACK_FF error on converting dates: ${e}`);
            }
          }
        } catch (e) {
          logger.error(`featureFlagValidation LIMIT_LOOKBACK_FF error: ${e}`);
        }
      }
    }
    return next();
  }

  return endpointWrapper(validateDateRange);
}
