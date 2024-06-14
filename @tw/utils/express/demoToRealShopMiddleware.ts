import { NextFunction, Response } from 'express';
import { TW_SHOP_ID_HEADER } from '@tw/constants';
import { endpointWrapper } from '../api';
import { getRealShopId } from '../demoShop';
import { RequestWithUser } from './getExpressApp';

export function demoToRealShopMiddleware(_shopId?: (req) => string) {
  async function replaceDemoShop(req: RequestWithUser, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user?.admin) {
      return next();
    }
    const shopId = !_shopId ? req.headers?.[TW_SHOP_ID_HEADER]?.toString() : _shopId(req);
    if (!shopId) {
      return next();
    }
    const realShopId = await getRealShopId(shopId, user);

    if (realShopId !== shopId) {
      req.body = JSON.parse(JSON.stringify(req.body).replace(new RegExp(shopId, 'g'), realShopId));

      if (req.query) {
        Object.keys(req.query).forEach((key) => {
          if (typeof req.query[key] === 'string') {
            req.query[key] = req.query[key].toString().replace(new RegExp(shopId, 'g'), realShopId);
          }
        });
      }

      if (req.headers[TW_SHOP_ID_HEADER]) {
        req.headers[TW_SHOP_ID_HEADER] = realShopId;
      }
    }
    next();
  }
  return endpointWrapper(replaceDemoShop);
}
