import { isStaging } from '@tw/constants';
import type { RateLimitConfig } from '@tw/types';
import type { RequestWithUser } from '@tw/types/module/services/users';
import { getRedisClient, type RedisClient } from '../redisClient';
import type { Response, NextFunction, Request } from '../express';
import * as clock from '../clock';
import { getSecret } from '../secrets';
import { logger } from '../logger';
import * as twPromise from '../promise';

let redis: RedisClient;
async function initRedisClient(redisHost?: string): Promise<void> {
  let REDIS_HOST = redisHost || getSecret('RATE_LIMITER_REDIS_HOST');
  if (!REDIS_HOST) {
    REDIS_HOST = (isStaging ? 'stg.' : '') + 'rate-limit.internal.whale3.io';
    logger.debug(`RATE_LIMITER_REDIS_HOST not found, using default: ${REDIS_HOST}`);
  }
  try {
    redis = getRedisClient(REDIS_HOST);
    await twPromise.timeout(60 * 1000, redis.connect());
  } catch (e) {
    logger.error('Failed to connect to redis: ' + e.message);
    throw e;
  }
}

export type RateLimitMiddlewareOptions = {
  throwOnError?: boolean;
  redisHost?: string;
  dryRun?: boolean;
  omitHeaders?: boolean;
};

export function rateLimitMiddleware<
  Req extends Request = RequestWithUser,
  Res extends Response = Response,
>(
  conf: RateLimitConfig<Req>,
  opt: RateLimitMiddlewareOptions = {
    throwOnError: false,
    dryRun: false,
    omitHeaders: false,
    redisHost: undefined,
  }
) {
  if (!redis) {
    initRedisClient(opt.redisHost).catch((e) => {
      logger.error('Failed to initialize redis client: ' + e.message);
      if (opt.throwOnError) {
        // will be unhandled promise rejection and crash the app
        throw e;
      }
      logger.error('Rate limiter will not work');
      return;
    });
  }
  return async function rateLimiter(req: Req, res: Res, next: NextFunction): Promise<void> {
    const reqUser =
      req.user?.sub ||
      (req.query?.userId as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')?.[0];
    const answers = (
      await Promise.all(
        conf.map(async (p) => {
          let userId: string;
          try {
            const { window, quota, condition, user } = p;
            userId = (user && user(req)) || reqUser;
            if (!userId) {
              return;
            }
            if (condition && !condition(req)) {
              return;
            }
            const key = getRateLimitKey(userId, req.path, window);

            // TODO: make redis calls atomic
            const count = await redis.incr(key);

            if (count === 1) {
              const now = clock.monotonic();
              const end = now + window * 1000;
              const duration = end - now;
              await Promise.all([
                redis.expire(key, window),
                redis.set(`${key}:window_end`, end, { EX: duration }), // seconds!
              ]);
            }
            const resetTime = +(await redis.get(`${key}:window_end`));
            const now = clock.monotonic();
            const diff = Math.ceil((resetTime - now) / 1000);
            return {
              count,
              secondsUntilReset: diff,
              userId,
              window: p.window,
              quota: p.quota,
            };
          } catch (e) {
            logger.error(e);
            if (opt.throwOnError) {
              throw e;
            }
            return {
              count: NaN,
              secondsUntilReset: NaN,
              userId,
              window: p.window,
              quota: p.quota,
              error: e,
            };
          }
        })
      )
    ).filter(Boolean);
    if (!answers.length) {
      return next();
    }
    const violations = answers.filter((a) => a.count > a.quota);
    if (violations.length) {
      const longestDiff = Math.max(...violations.map((v) => +v.secondsUntilReset));
      if (!opt.omitHeaders) {
        res.header('Retry-After', '' + longestDiff);
        res.header('RateLimit-Policy', getPolicyFromConf(conf));
      }
      if (opt.dryRun) {
        logger.debug({
          message: 'Dry run rate limit violation',
          violations,
        });
        return next();
      }
      res.status(429).send('Too Many Requests');
      return;
    }
    if (!opt.omitHeaders) {
      answers.forEach((a) =>
        res.header(
          'RateLimit',
          `limit=${a.quota}, remaining=${a.quota - a.count}, reset=${a.secondsUntilReset}`
        )
      );
      res.header('RateLimit-Policy', getPolicyFromConf(conf));
    }
    next();
  };
}

// a Rate Limit Policy String looks like this:
// "1;w=1, 2;w=60"
// which means:
// 1 request per 1 second
// 2 requests per 60 seconds
function getPolicyFromConf(conf: RateLimitConfig<Request>): string {
  return conf.map((p) => `${p.quota};w=${p.window}`).join(', ');
}

export function serializeConf(conf: RateLimitConfig): string {
  return JSON.stringify(
    conf.map((p) => ({
      window: p.window,
      quota: p.quota,
      ...(p.condition && { condition: p.condition?.toString() }),
      ...(p.user && { user: p.user?.toString() }),
    }))
  );
}

export function parseConf(conf: string): RateLimitConfig {
  return JSON.parse(conf).map((p) => ({
    window: p.window,
    quota: p.quota,
    ...(p.condition && { condition: Function(`return ${p.condition}`)() }),
    ...(p.user && { user: Function(`return ${p.user}`)() }),
  }));
}

function getRateLimitKey(userId: string, path: string, window: number): string {
  return `${process.env.SERVICE_ID}-rate-limit-${userId}:${path}:${window}`;
}

export const _test = {
  getPolicyFromConf,
  getRateLimitKey,
};
