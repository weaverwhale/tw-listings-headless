import { firestore } from 'firebase-admin';
import {
  ServiceAccountData,
  ServiceAccountParams,
  ShopServiceData,
} from '@tw/types/module/types/ShopServiceData';
import { services, ServicesIds } from '@tw/types/module/services';
import { getShop, getShopData } from './getShopData';
import { logger } from './logger';
import { callServiceEndpoint } from './callServiceEndpoint';
import { CreateJobRequest } from '@tw/types/module/services/job-manager';
import { Shop } from '@tw/types';
import { ShopIntegrationStatusEnum } from '@tw/types/module/types/ShopProviders';
import { saveIntegrationStatusForShop } from './shop/saveIntegrationStatusForShop';
import { deleteProviderStateFromShop } from './shop/deleteProviderStateFromShop';
import { deleteIntegrationStateFromShop } from './shop';

const servicesSupported: ServicesIds[] = ['tiktok-ads', 'facebook-ads']; //temp - till all services will support InvalidConnection

export function getShopServiceDoc(shopDomain: string, serviceId: ServicesIds) {
  logger.info(`getShopServiceDoc: ${shopDomain} ${serviceId}`);
  return firestore().collection('shops').doc(shopDomain).collection('services').doc(serviceId);
}

export async function getShopServiceData(
  shopDomain: string,
  serviceId: ServicesIds
): Promise<ShopServiceData> {
  return (await getShopServiceDoc(shopDomain, serviceId).get()).data() as ShopServiceData;
}

export async function getIsServiceConnected(
  shopData: Shop,
  serviceId: ServicesIds
): Promise<boolean> {
  let isConnected: boolean = true;

  try {
    if (!shopData) {
      logger.warn(`getIsServiceConnected: shopData is undefined`, { serviceId });
      return isConnected;
    }
    if (!services[serviceId].getAccessToken(shopData)) {
      logger.info(
        `getIsServiceConnected: shop has no AccessToken: ${shopData.id} serviceId: ${serviceId}`
      );
      return false;
    }

    if (!services[serviceId].getAccounts(shopData)?.length) {
      logger.info(`getIsServiceConnected: shop has no Accounts, serviceId: ${serviceId}`);
      return false;
    }
    let accounts: { [accountId: string]: ServiceAccountData };

    if (servicesSupported.includes(serviceId)) {
      try {
        accounts = (await getShopServiceData(shopData.id, serviceId))?.accounts;
        isConnected = !(
          accounts && Object.values(accounts).some((account) => account?.invalidConnection)
        );
      } catch (error) {
        logger.error('getIsServiceConnected error', { serviceId, error });
      }
    } else
      isConnected = !(
        services[serviceId].getIsConnected && !services[serviceId].getIsConnected(shopData)
      );

    if (!isConnected)
      logger.info(`getIsServiceConnected: shop has invalid connection, serviceId: ${serviceId}`);
  } catch (error) {
    logger.error('getIsServiceConnected failed', { serviceId, error });
  }

  return isConnected;
}

export async function deleteAccounts(
  shopDomain: string,
  serviceId: ServicesIds,
  accountId?: string
) {
  try {
    if (!accountId) {
      await deleteProviderStateFromShop(shopDomain, serviceId);
    } else {
      await deleteIntegrationStateFromShop(shopDomain, accountId, serviceId);
    }
    const doc = getShopServiceDoc(shopDomain, serviceId);
    const shop = getShop(shopDomain);
    if (accountId) {
      await doc.set(
        {
          accounts: {
            [accountId]: firestore.FieldValue.delete(),
          },
        },
        { merge: true }
      );
    } else {
      await doc.set(
        {
          accounts: firestore.FieldValue.delete(),
        },
        { merge: true }
      );
    }

    if (serviceId === 'facebook-ads') {
      await shop.set(
        {
          facebookInvalidConnectionState: firestore.FieldValue.delete(),
        },
        { merge: true }
      );
    }

    logger.info(
      `reset invalid connection done, shopDomain: ${shopDomain} serviceId: ${serviceId} accountId: ${accountId}`
    );
  } catch (e) {
    logger.error(
      `reset invalid connection done error, shopDomain: ${shopDomain} serviceId: ${serviceId} accountId: ${accountId} ,  error: ${JSON.stringify(
        e
      )}`
    );
    throw e;
  }
}
export async function saveInvalidAccountConnection(params: ServiceAccountParams) {
  try {
    const { shopDomain, serviceId, accountId, invalidConnection } = params;
    const shopData = await getShopData(shopDomain);
    const isConnected = await getIsServiceConnected(shopData, serviceId);
    if (!isConnected) {
      logger.info('saveInvalidAccountConnection: shop is already not connected');
      return;
    }
    await saveIntegrationStatusForShop(
      shopDomain,
      serviceId,
      accountId,
      ShopIntegrationStatusEnum.error,
      invalidConnection?.invalidStateReason
    );

    const doc = getShopServiceDoc(params.shopDomain, params.serviceId);
    const shop = getShop(params.shopDomain);

    await doc.set(
      {
        accounts: {
          [params.accountId]: {
            invalidConnection: {
              invalidStateReason: params.invalidConnection?.invalidStateReason,
              invalidStateCode: params.invalidConnection?.invalidStateCode ?? null,
              jobId: params.invalidConnection?.jobId ?? null,
              timestamp:
                params.invalidConnection?.timestamp ?? firestore.FieldValue.serverTimestamp(),
            },
          },
        },
      },
      { merge: true }
    );

    if (params.serviceId === 'facebook-ads') {
      await shop.set(
        {
          facebookInvalidConnectionState: true,
        },
        { merge: true }
      );
    }

    logger.info(
      `saveInvalidAccountConnection done, shopDomain: ${params.shopDomain} serviceId: ${params.serviceId}`
    );
  } catch (e) {
    logger.error(
      `saveInvalidAccountConnection error, shopDomain: ${params.shopDomain} serviceId: ${
        params.serviceId
      } ,  error: ${JSON.stringify(e)}`
    );
    throw e;
  }
}
export async function updateLastImport(shopDomain: string, serviceId: ServicesIds, date?: Date) {
  try {
    let doc = getShopServiceDoc(shopDomain, serviceId);

    await doc.set(
      {
        lastImportTimestamp: date
          ? firestore.Timestamp.fromDate(date)
          : firestore.Timestamp.fromDate(new Date()),
      },
      { merge: true }
    );
  } catch (e) {
    logger.error(
      `updateLastImport error, shopDomain: ${shopDomain} serviceId: ${serviceId} ,  error: ${JSON.stringify(
        e
      )}`
    );
    throw e;
  }
}

export async function getLastImport(shopDomain: string, serviceId: ServicesIds) {
  try {
    return (await getShopServiceDoc(shopDomain, serviceId).get())
      .data()
      ?.lastImportTimestamp?.toDate();
  } catch (e) {
    logger.error(
      `getLastImport error, shopDomain: ${shopDomain} serviceId: ${serviceId} ,  error: ${JSON.stringify(
        e
      )}`
    );
    return null;
  }
}

export async function checkServicesConnection(shopDomain: string) {
  try {
    await Promise.all(
      servicesSupported.map(async (serviceId) => {
        try {
          let accounts = (await getShopServiceData(shopDomain, serviceId))?.accounts;

          if (
            accounts &&
            Object.values(accounts).some(
              (account: ServiceAccountData) => account?.invalidConnection
            )
          ) {
            const res = await callServiceEndpoint<boolean>(
              serviceId,
              `ping-shop/${shopDomain}`,
              {},
              { method: 'GET' }
            );
            logger.info(
              `checkServicesConnection, shopDomain: ${shopDomain} ,serviceId ${serviceId}  ping res: ${res?.data}`
            );
            if (res?.data) {
              const data = (
                await callServiceEndpoint<any, CreateJobRequest>('job-manager', 'start-job', {
                  serviceId,
                  shopDomain,
                  checkBefore: true,
                  jobType: 'initial',
                  resetShopServices: true,
                })
              ).data;
              logger.info(
                `checkServicesConnection, shopDomain: ${shopDomain} ,serviceId ${serviceId}  res start-job ${data}`
              );
            }
          }
        } catch (e) {
          logger.error(
            `checkServicesConnection error, shopDomain: ${shopDomain} ,serviceId ${serviceId}  error: ${JSON.stringify(
              e
            )}`
          );
        }
      })
    );
  } catch (e) {
    logger.error(
      `checkServicesConnection error, shopDomain: ${shopDomain} ,  error: ${JSON.stringify(e)}`
    );
    throw e;
  }
}
