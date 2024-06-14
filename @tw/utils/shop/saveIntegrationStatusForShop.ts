import { firestore } from 'firebase-admin';
import { getShop } from '../getShopData';
import { logger } from '../logger';
import { ShopIntegrationStatusEnum } from '@tw/types/module/types/ShopProviders';
import { callPubSub } from '../callPubSub';
import { startCase } from 'lodash';

export async function saveIntegrationStatusForShop(
  shopId: string,
  providerId: string,
  integrationId: string,
  status: ShopIntegrationStatusEnum,
  errorMessage?: string
): Promise<void> {
  try {
    const shopRef = getShop(shopId);
    const integrationUpdate = {
      status,
    };

    if (errorMessage) {
      integrationUpdate['error'] = {
        errorMessage,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
    }
    await shopRef.set(
      {
        providers: {
          [providerId]: {
            integrations: {
              [integrationId]: integrationUpdate,
            },
          },
        },
      },
      { merge: true }
    );
    logger.info(`saveIntegrationStatusForShop account ${integrationId}:`, {
      shopId,
      providerId,
      integrationId,
      status,
    });
    if (status == ShopIntegrationStatusEnum.error) {
      const connectionErrorMsg = errorMessage ? `Connection Error:  ${errorMessage}` : '';
      await callPubSub('new_activities_created', {
        shopId,
        serviceId: 'triple-whale',
        activities: [
          {
            type: 'update',
            date: new Date(),
            serviceId: 'triple-whale',
            annotation: false,
            shopId,
            entity: 'integration',
            source: providerId,
            title: 'Integration Connection Error',
            description: `${startCase(
              providerId
            )} Connection Error - Please Reconnect, ${connectionErrorMsg}`,
            id: `triple-whale_${providerId}_integration_connection_error_${new Date()}`,
          },
        ],
      });
    }
  } catch (error) {
    logger.error(`saveIntegrationStatusForShop failed account ${integrationId}:`, {
      error,
      shopId,
      providerId,
      integrationId,
      status,
    });
  }
}
