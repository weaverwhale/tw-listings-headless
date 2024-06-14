import { isLocal, projectId } from '@tw/constants';
import axios from 'axios';
import { getGCPClientEmail } from './token';
import { logger } from '../logger';

const metadataServerUrl = 'http://metadata.google.internal';
const proxyMetadataServerUrl = `http://${process.env.K8S_HOST_IP}:6382`;
const headers = { 'Metadata-Flavor': 'Google' };

let serviceAccountEmail: string;

function callMetadataServer(url: string, proxy?: boolean) {
  return axios.get(proxy ? proxyMetadataServerUrl : metadataServerUrl + url, {
    headers,
  });
}

export async function getCloudRunInstanceId(): Promise<string> {
  const { data } = await callMetadataServer('/computeMetadata/v1/instance/id');
  return data;
}

const projectIdTonumber = {
  shofifi: 1072436220726,
  'triple-whale-staging': 89529659540,
};

export async function getServiceAccountEmail(): Promise<string> {
  if (!serviceAccountEmail) {
    if (isLocal) {
      serviceAccountEmail = await getGCPClientEmail();
      if (!serviceAccountEmail) {
        serviceAccountEmail = `${projectIdTonumber[projectId]}-compute@developer.gserviceaccount.com`;
      }
    } else {
      const { data } = await callMetadataServer(
        '/computeMetadata/v1/instance/service-accounts/default/email'
      );
      serviceAccountEmail = data;
    }
  }
  return serviceAccountEmail;
}

export async function checkIfPreempted() {
  const { data } = await callMetadataServer('/computeMetadata/v1/instance/preempted', true);
  logger.info(`Preempted data: ${data}`);
  return data === 'TRUE';
}
