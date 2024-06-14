import { getAppSecret, getClientSecrets } from '@tw/temporal';
import {
  ProviderAccount,
  AuthParams,
  GetAccountParams,
  GetDefaultBackfillRangeCount,
} from '@tw/types/module/sensory';
export async function auth(args: AuthParams): Promise<any> {
  // const appSecrets = await getAppSecret();
  throw new Error('Not implemented');
}

export async function accounts(args: GetAccountParams): Promise<ProviderAccount[]> {
  // const appSecrets = await getAppSecret();
  // const clientSecrets = await getClientSecrets(args);
  throw new Error('Not implemented');
}

export async function getDefaultBackfillRangeCount(
  args: GetDefaultBackfillRangeCount
): Promise<number> {
  // const appSecrets = await getAppSecret();
  // const clientSecrets = await getClientSecrets(args);
  throw new Error('Not implemented');
}
