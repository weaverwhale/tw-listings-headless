import { RequestWithUser, Response } from '@tw/utils/module/express';

export default async function someEndpoint(req: RequestWithUser, res: Response) {
  return res.send('hi');
}
