import { callServiceEndpoint } from './callServiceEndpoint';
import { FullShopifyOrder } from '@tw/types/module/types/FullShopifyOrder';

export async function getOrder(shopId: string, id: string): Promise<FullShopifyOrder> {
  const orders =
    (
      await callServiceEndpoint('shopify', 'mongo/get-orders', {
        id,
        shopId,
      })
    ).data || [];
  return orders.length > 0 ? (orders[0] as FullShopifyOrder) : null;
}

export async function getOrders<T extends Partial<FullShopifyOrder>>(
  shopId: string,
  ids: string[],
  fields: (keyof T)[],
  limit?: number
): Promise<T[]> {
  const orders =
    (
      await callServiceEndpoint('shopify', 'mongo/get-orders', {
        shopId,
        ids,
        fields,
        ...(limit && { limit }),
      })
    ).data || [];
  return orders as T[];
}
