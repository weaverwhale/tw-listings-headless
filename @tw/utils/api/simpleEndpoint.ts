import type { Request, Response } from '../express/getExpressApp';

export function simpleEndpoint(fn: (any) => any) {
  return async function simpleEndpoint(req: Request, res: Response) {
    let args;
    if (req.method === 'POST') {
      args = req.body;
    } else {
      args = req.query;
    }
    res.json(await fn(args));
  };
}
