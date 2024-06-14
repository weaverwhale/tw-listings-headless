import { CheckAuthResponse } from '@tw/types';
import { Response } from 'express';

export function deny(res: Response, authResponse?: CheckAuthResponse) {
  const { message = 'Access Denied', code = 403 } = authResponse || {};
  return res.status(code).send(message);
}
