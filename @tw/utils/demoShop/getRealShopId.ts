import { FirebaseUser } from '@tw/types';
import { getShopData } from '../getShopData';
import { logger } from '../logger';

export async function getRealShopId(shopId: string, user: FirebaseUser | undefined) {
  try {
    if (!user?.admin || !shopId) {
      return shopId;
    }
    const realShopId = await fetchRealShopId(shopId);
    return realShopId;
  } catch (error) {
    logger.error('Error getting real shop id', { error, shopId });
    return shopId;
  }
}

export async function fetchRealShopId(shopId: string) {
  try {
    const { isDemoShop, sourceDemoShop } = await getShopData(shopId, {
      fields: ['isDemoShop', 'sourceDemoShop'],
    });

    if (isDemoShop && sourceDemoShop) {
      return sourceDemoShop;
    }
  } catch (error) {
    logger.error('Error fetching real shop id', { error, shopId });
  }
  return shopId;
}
