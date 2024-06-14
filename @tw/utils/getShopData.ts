import { firestore } from 'firebase-admin';

import { Shop } from '@tw/types';
import { ShopWithSensory } from '@tw/types';
import { callServiceEndpoint } from './callServiceEndpoint';
import { ServicesIds } from '@tw/types/module/services';
import {
  Integration,
  Provider,
  ProviderCredential,
} from '@tw/types/module/services/account-manager';

export function getShop(shopDomain: string) {
  return firestore().collection('shops').doc(shopDomain);
}
export const setTrendsShop = async (shopDomain: string, userId: string, dataToSet) => {
  await setShop(shopDomain, userId, { ...dataToSet, isTrendsShop: true });
};

export async function setShop(shopDomain: string, userId: string, dataToSet: {}) {
  const shopRef = firestore().collection('shops').doc(shopDomain);
  const doc = await shopRef.get();
  if (!doc.exists) {
    await shopRef.set(
      {
        ...dataToSet,
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        created_at: firestore.FieldValue.serverTimestamp(),
        subscriptionActive: true,
      },
      { merge: true }
    );
    await shopRef.collection(`users`).doc(userId).set({ creator: true });
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    await userRef.update({
      shops: {
        ...userDoc.data()?.shops,
        [shopDomain]: { roles: ['owner'] },
      },
    });
  } else {
    await shopRef.update(dataToSet);
  }
}

export const sensoryProviderConvertResponse: (providerResponse: Provider[]) => {
  [key in ServicesIds]: { integrations: Integration[]; credentials: ProviderCredential[] };
} = (providerResponse: Provider[]) => {
  return providerResponse.reduce((acc, provider) => {
    const { integrations, id, credentials } = provider;
    return {
      ...acc,
      [id]: {
        integrations,
        credentials,
      },
    };
  }, {} as { [key in ServicesIds]: { integrations: Integration[]; credentials: ProviderCredential[] } });
};

export async function getShopData<
  T extends boolean = false,
  R = T extends true ? ShopWithSensory : Shop
>(
  shopId: string,
  args?: { fields?: (keyof Shop)[]; mongo?: boolean },
  includeSensory: T = false as T,
  includePixel: boolean = false
): Promise<R> {
  if (!shopId) throw new Error('shopId is required');
  const { fields = [], mongo = true } = args || {};

  let shopCall, sensoryCall, pixelCall;
  if (includeSensory) {
    sensoryCall = callServiceEndpoint<Provider[]>(
      'account-manager',
      `integrations/providers/${shopId}`,
      null,
      { method: 'GET' }
    );
  } else {
    sensoryCall = Promise.resolve(null);
  }
  if (includePixel) {
    pixelCall = firestore()
      .collection('shops')
      .doc(shopId)
      .collection('pixel_install_status')
      .doc('pixel_install_status')
      .get();
  } else {
    pixelCall = Promise.resolve(null);
  }

  if (mongo || fields.length) {
    shopCall = callServiceEndpoint<Shop[]>(
      'users',
      'get-shops',
      { id: shopId, fields },
      { method: 'POST', log: false }
    );

    const [shopRes, sensoryRes, pixelRes] = await Promise.all([shopCall, sensoryCall, pixelCall]);
    if (shopRes.data.length > 0) {
      const shop = shopRes.data[0];
      if (includePixel) {
        shop.pixel_install_status = pixelRes.data();
      }
      if (includeSensory) {
        return { ...shop, sensory: sensoryProviderConvertResponse(sensoryRes.data) } as R;
      }
      return shop as R;
    } else {
      return {} as R;
    }
  } else {
    shopCall = getShop(shopId).get();
    const [shopRes, sensoryRes, pixelRes] = await Promise.all([shopCall, sensoryCall, pixelCall]);
    if (shopRes.exists) {
      const shop = shopRes.data();
      const result = {
        ...shop,
        id: shopId,
      };
      if (includePixel) {
        result.pixel_install_status = pixelRes.data();
      }
      if (includeSensory) {
        result.sensory = sensoryProviderConvertResponse(sensoryRes.data);
      }
      return result as R;
    } else {
      return {} as R;
    }
  }
}
