import { firestore } from 'firebase-admin';
import { getShop } from '../getShopData';
import { logger } from '../logger';

export async function deleteProviderStateFromShop(
  shopId: string,
  providerId: string
): Promise<void> {
  try {
    const shopRef = getShop(shopId);
    await shopRef.set(
      {
        providers: {
          [providerId]: firestore.FieldValue.delete(),
        },
      },
      { merge: true }
    );
    logger.info(`deleteProviderStateFromShop success`, {
      shopId,
      providerId,
    });
  } catch (error) {
    logger.error(`deleteProviderStateFromShop failed`, {
      error,
      shopId,
      providerId,
    });
  }
}

export async function deleteProviderErrorFromShop(
  shopId: string,
  providerId: string
): Promise<void> {
  try {
    const shopRef = getShop(shopId);
    await shopRef.set(
      {
        providers: {
          [providerId]: {
            integrations: {
              error: firestore.FieldValue.delete(),
            },
          },
        },
      },
      { merge: true }
    );
    logger.info(`deleteProviderErrorFromShop success`, {
      shopId,
      providerId,
    });
  } catch (error) {
    logger.error(`deleteProviderErrorFromShop failed`, {
      error,
      shopId,
      providerId,
    });
  }
}
