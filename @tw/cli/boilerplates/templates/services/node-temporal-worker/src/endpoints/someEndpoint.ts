import { Request, Response } from '@tw/utils/module/express';

export default async function someEndpoint(req: Request, res: Response) {
  return res.send('hi');
}
