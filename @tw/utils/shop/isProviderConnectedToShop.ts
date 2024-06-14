import { services, ServicesIds } from '@tw/types/module/services';
import { Shop } from '@tw/types';
import { ShopProviderStatusEnum } from '@tw/types/module/types/ShopProviders';
import { logger } from '../logger';

export function isProviderConnectedToShop(shopData: Shop, providerId: ServicesIds): boolean {
  try {
    if (!shopData) {
      logger.warn(`isProviderConnectedToShop: shopData is undefined`, { providerId });
      throw new Error('shopData is undefined');
    }

    if (services[providerId].getShopProviderStatus) {
      const providerStatus = services[providerId].getShopProviderStatus(shopData);
      return (
        providerStatus.status != ShopProviderStatusEnum.disconnected && !providerStatus.errorMessage
      );
    }

    if (services[providerId].getAccessToken && !services[providerId].getAccessToken(shopData)) {
      logger.info(
        `isProviderConnectedToShop: shop has no AccessToken: ${shopData.id} serviceId: ${providerId}`
      );
      return false;
    }

    if (!services[providerId].getAccounts(shopData)?.length) {
      logger.info(`isProviderConnectedToShop: shop has no Accounts, serviceId: ${providerId}`);
      return false;
    }

    if (services[providerId].getIsConnected && !services[providerId].getIsConnected(shopData)) {
      logger.info(
        `isProviderConnectedToShop: shop has invalid connection, providerId: ${providerId}`
      );
      return false;
    }
  } catch (error) {
    logger.error('isProviderConnectedToShop failed', { providerId, error });
  }

  return true;
}
