import { firestore } from 'firebase-admin';
import { getShop } from '../getShopData';
import { logger } from '../logger';

export async function deleteIntegrationStateFromShop(
  shopId: string,
  providerId: string,
  integrationId: string
): Promise<void> {
  try {
    const shopRef = getShop(shopId);
    await shopRef.set(
      {
        providers: {
          [providerId]: {
            integrations: {
              [integrationId]: firestore.FieldValue.delete(),
            },
          },
        },
      },
      { merge: true }
    );
    logger.info(`deleteIntegrationStateFromShop account ${integrationId}:`, {
      shopId,
      providerId,
      integrationId,
    });
  } catch (error) {
    logger.error(`deleteIntegrationStateFromShop failed account ${integrationId}:`, {
      error,
      shopId,
      providerId,
      integrationId,
    });
  }
}
