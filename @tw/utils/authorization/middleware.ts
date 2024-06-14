import { Request, Response, NextFunction } from '../express';

export function getAuthorizationMiddleware<
  Req extends Request = Request,
  Res extends Response = Response,
  Next extends NextFunction = NextFunction,
>() {
  return function authorizationMiddleware(req: Req, res: Res, next: Next) {
    // TODO
    next();
  };
}
