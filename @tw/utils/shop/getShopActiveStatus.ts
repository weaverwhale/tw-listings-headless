import {callServiceEndpoint} from "../callServiceEndpoint";

export async function getShopActiveStatus(shopId: string, shopData?: any): Promise<boolean> {
    try {
        let shop;
        if (!shopData) {
            const { data } = await callServiceEndpoint<any>(
              'users',
              'get-shops',
              { id: shopId, fields: ['subscriptionActive'] },
              { method: 'POST', log: false }
            );
            shop = data[0] || null;
        } else {
            shop = shopData;
        }
        return shop.subscriptionActive;
    } catch (err) {
        return false;
    }
}