import { getAppSecret, getClientSecrets, heartbeat } from '@tw/temporal';
import { ReportData, FetcherParams } from '@tw/types/module/sensory';

export async function getData(params: FetcherParams): Promise<ReportData> {
  // const appSecrets = await getAppSecret();
  // const clientSecrets = await getClientSecrets({credentialsId: params.integrationDetails.credentialsId});
  heartbeat("I'm alive!");
  throw new Error('Not implemented');
}
