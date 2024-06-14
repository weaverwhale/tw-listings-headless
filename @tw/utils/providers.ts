import { ShopWithSensory } from '@tw/types';
import { services, ServicesIds } from '@tw/types/module/services';
import { getShopData } from './getShopData';

export type serviceToAccounts = {
  [key in ServicesIds]: { id: string; providerAccount: string; integrationId?: string }[];
};
const getAllAccountsIdsByService = (shopData: ShopWithSensory): serviceToAccounts => {
  return Object.entries(services).reduce((acc, [serviceId, service]) => {
    const integrations = service.getAccounts(shopData) ?? [];
    return {
      ...acc,
      [serviceId as ServicesIds]: integrations.map((integration) => ({
        id: integration.id,
        providerAccount: integration.providerAccount,
        integrationId: integration.integrationId,
      })),
    };
  }, {} as serviceToAccounts);
};

export function getShopAccountIds(shopId: string): Promise<serviceToAccounts>;

export function getShopAccountIds(
  shopId: string,
  providerId: ServicesIds
): Promise<{ id: string; providerAccount: string }[]>;

export async function getShopAccountIds(shopId: string, providerId?: ServicesIds) {
  const shopData = await getShopData(shopId, undefined, true);
  if (providerId) {
    return getAllAccountsIdsByService(shopData!)[providerId];
  } else {
    return getAllAccountsIdsByService(shopData!);
  }
}
