import { type Request } from 'express';
import { RequestWithUser } from '../services/users';

export type RateLimitConfig<Req extends Request = RequestWithUser> = {
  window: number; // in seconds
  quota: number; // per api key user

  // called with req object to determine if this rate limit should be applied
  // this function cannot rely on any other values in scope, must be expressed
  // only in terms of the request object
  condition?: (req: Req) => boolean;

  // called with req object to determine the 'user' for this rate limit (overrides req.user or header or query)
  // this function cannot rely on any other values in scope, must be expressed
  // only in terms of the request object
  user?: (req: Req) => string;
}[];
