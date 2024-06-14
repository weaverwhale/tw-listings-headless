import { mockRedis } from '@tw/test-utils/module/redis';
import { testApi } from '@tw/test-utils/module/express';
import * as clock from '../clock';
import type { RequestWithUser } from '@tw/types/module/services/users';
import { type Response, type NextFunction, getExpressApp } from '../express';
import { rateLimitMiddleware, _test, type RateLimitMiddlewareOptions } from './rateLimitMiddleware';
import type { RateLimitConfig } from '@tw/types';

const { getPolicyFromConf, getRateLimitKey } = _test;

jest.mock('../logger', () => {
  const mockLogger = {
    debug: jest.fn().mockImplementation((...msg) => console.log(...msg)),
    info: jest.fn().mockImplementation((...msg) => console.log(...msg)),
    warn: jest.fn().mockImplementation((...msg) => console.log(...msg)),
    error: jest.fn().mockImplementation((...msg) => console.log(...msg)),
  };

  return {
    __esModule: true,
    logger: mockLogger,
    getLogger: () => mockLogger,
  };
});

import { logger as mockedLogger } from '../logger';

describe('getPolicyFromConf', () => {
  it('gets a policy string from a config', () => {
    const conf = [
      { quota: 1, window: 1 },
      { quota: 2, window: 60 },
    ];
    const policy = getPolicyFromConf(conf);
    expect(policy).toEqual('1;w=1, 2;w=60');
  });
});

describe('getRateLimiterMiddleware', () => {
  let redis, req, res, next;
  beforeEach(() => {
    redis = mockRedis();
    req = {
      user: { sub: 'test_user' },
      headers: {},
      path: '/test',
    };
    res = {
      header: jest.fn(function () {
        return this;
      }),
      status: jest.fn(function () {
        return this;
      }),
      send: jest.fn(),
    };
    next = jest.fn();
  });
  afterEach(() => {
    redis.testClear();
  });
  it('gets a middleware function', () => {
    const middleware = rateLimitMiddleware([{ quota: 1, window: 1 }]);
    expect(middleware).toBeInstanceOf(Function);
  });
  it('does not rate limit if no user', async () => {
    const mw = rateLimitMiddleware([{ quota: 1, window: 1 }]);
    req = {
      ...req,
      user: null,
    };
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
  });
  it('calls next() if under quota', async () => {
    const mw = rateLimitMiddleware([
      { quota: 1, window: 1 }, // 1 request per 1 second
    ]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.header).toHaveBeenCalled();
  });
  it('returns 429 if over quota', async () => {
    const key = getRateLimitKey(req.user.sub, req.path, 1);
    await redis.set(key, 1);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    const mw = rateLimitMiddleware([
      { quota: 1, window: 1 }, // 1 request per 1 second
    ]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(+res.header.mock.calls[0][1] >= 1).toBe(true);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
  it('returns 429 if over even 1 quota', async () => {
    const key = getRateLimitKey(req.user.sub, req.path, 1);
    await redis.set(key, 1);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    const mw = rateLimitMiddleware([
      { quota: 1, window: 1 }, // 1 request per 1 second
      { quota: 2, window: 60 }, // 2 requests per 60 seconds
    ]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(+res.header.mock.calls[0][1] >= 1).toBe(true);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
  it('returns the longest Retry-After if more than one policy is broken', async () => {
    const key = getRateLimitKey(req.user.sub, req.path, 1);
    const key60 = getRateLimitKey(req.user.sub, req.path, 60);
    await redis.set(key, 1);
    await redis.set(key60, 2);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    await redis.set(`${key60}:window_end`, clock.monotonic() + 60000);
    const mw = rateLimitMiddleware([
      { quota: 1, window: 1 }, // 1 request per 1 second
      { quota: 2, window: 60 }, // 2 requests per 60 seconds
    ]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(+res.header.mock.calls[0][1] >= 60).toBe(true);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
  it('applies quotas conditionally', async () => {
    const key = getRateLimitKey(req.user.sub, req.path, 1);
    await redis.set(key, 1);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    const mw = rateLimitMiddleware([
      { quota: 1, window: 1, condition: (req) => req.path !== '/test' },
      { quota: 2, window: 60 },
    ]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.header).toHaveBeenCalled();
  });
  it('accepts custom getUser function', async () => {
    const userId = 'custom_test_user';
    const key = getRateLimitKey(userId, req.path, 1);
    await redis.set(key, 1);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    const getUser = jest.fn(() => userId);
    const mw = rateLimitMiddleware([{ quota: 1, window: 1, user: getUser }]);
    const reqWithoutUser = {
      ...req,
      user: null,
    };
    await mw(reqWithoutUser as RequestWithUser, res as any as Response, next as NextFunction);
    expect(getUser).toHaveBeenCalledWith(reqWithoutUser);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
  it('still falls back to other options if getUser function returns empty string', async () => {
    const key = getRateLimitKey(req.user.sub, req.path, 1);
    await redis.set(key, 1);
    await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
    const getUser = jest.fn(() => '');
    const mw = rateLimitMiddleware([{ quota: 1, window: 1, user: getUser }]);
    await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
    expect(getUser).toHaveBeenCalledWith(req);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
  describe('with errors', () => {
    it('handles errors nicely', async () => {
      const mw = rateLimitMiddleware([
        {
          quota: 1,
          window: 1,
          condition: () => {
            throw new Error('deadbeef');
          },
        },
      ]);
      await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
      expect(next).toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenCalled();
    });
    it('doesnt apply limits if there are errors in the condition', async () => {
      const key = getRateLimitKey(req.user.sub, req.path, 1);
      await redis.set(key, 1);
      await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
      const mw = rateLimitMiddleware([
        {
          quota: 1,
          window: 1,
          condition: () => {
            throw new Error('deadbeef');
          },
        },
      ]);
      await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
      expect(mockedLogger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.header).toHaveBeenCalled(); // should add 'RateLimit-Policy' header
    });
    it('doesnt apply limits if there are errors in the user function', async () => {
      const key = getRateLimitKey(req.user.sub, req.path, 1);
      await redis.set(key, 1);
      await redis.set(`${key}:window_end`, clock.monotonic() + 1000);
      const getUser = jest.fn(() => {
        throw new Error('deadbeef');
      });
      const mw = rateLimitMiddleware([{ quota: 1, window: 1, user: getUser }]);
      await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
      expect(mockedLogger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.header).toHaveBeenCalled(); // should add 'RateLimit-Policy' header
    });
    it('headers can be omitted', async () => {
      const mw = rateLimitMiddleware([{ quota: 1, window: 1 }], { omitHeaders: true });
      await mw(req as RequestWithUser, res as any as Response, next as NextFunction);
      expect(next).toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });
});

describe('with an app', () => {
  let redis;
  let getApi;
  beforeEach(() => {
    redis = mockRedis();
    getApi = function (policy: RateLimitConfig, opts?: RateLimitMiddlewareOptions) {
      const { app } = getExpressApp({ autoOpenApi: true });
      app.get('/test', rateLimitMiddleware(policy, opts), (req, res) => {
        res.send('ok');
      });
      return testApi(app);
    };
  });
  afterEach(() => {
    redis.testClear();
  });
  it('limits rate', async () => {
    const api = getApi([{ quota: 1, window: 1 }]);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(429);
  });
  it('works with userId in the query string', async () => {
    const conf = [{ quota: 1, window: 1 }];
    const api = getApi(conf);
    await api.get('/test?userId=test_user').expect(200);
    let res = await api.get('/test?userId=test_user').expect(429);
    expect(res.headers['ratelimit-policy']).toBe(getPolicyFromConf(conf));
    expect(res.headers['retry-after']).toBe('1');
  });
  it('doesnt limit if under quota', async () => {
    const conf = [{ quota: 3, window: 1 }];
    const api = getApi(conf);
    let res = await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    expect(res.headers['ratelimit-policy']).toBe(getPolicyFromConf(conf));
    expect(res.headers['ratelimit']).toBe('limit=3, remaining=2, reset=1');
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    jest.advanceTimersByTime(1000);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
  });
  // TODO: billy - mock the correct logger module
  it.skip('only logs on dry run', async () => {
    const { app } = getExpressApp({ autoOpenApi: true });
    app.get(
      '/test',
      rateLimitMiddleware(
        [
          {
            quota: 1,
            window: 1,
          },
        ],
        {
          dryRun: true,
        }
      ),
      (req, res) => {
        res.send('ok');
      }
    );
    const api = testApi(app);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    expect(mockedLogger.info).toHaveBeenCalledWith({
      message: 'Dry run rate limit violation',
      violations: [{ count: 2, secondsUntilReset: 1, quota: 1, window: 1, userId: 'test_user' }],
    });
  });
  it('headers can be omitted', async () => {
    const api = getApi([{ quota: 1, window: 1 }], { omitHeaders: true });
    const res = await api.get('/test').set('x-forwarded-for', 'test_user').expect(200);
    expect(res.headers['ratelimit-policy']).toBeUndefined();
    expect(res.headers['retry-after']).toBeUndefined();
    expect(res.headers['ratelimit']).toBeUndefined();
  });
});
