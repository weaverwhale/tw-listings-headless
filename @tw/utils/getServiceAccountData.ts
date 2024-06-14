import { IntegrationAccountData } from '@tw/types/module/services/IntegrationAccountData';
import { callServiceEndpoint } from './callServiceEndpoint';

export async function getServiceAccountData(
  accountId: string,
  serviceId?: string
): Promise<IntegrationAccountData> {
  if (!serviceId) {
    serviceId = process.env.SERVICE_ID;
  }
  const { data } = await callServiceEndpoint<IntegrationAccountData>(
    serviceId,
    'getAccountData',
    { id: accountId },
    { method: 'POST' }
  );
  return data || null;
}
