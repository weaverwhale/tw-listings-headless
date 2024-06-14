import * as datadog from '@pulumi/datadog';
import { getSecretValue } from '../secrets';

let datadogProvider;

export function getDatadogProvider() {
  if (!datadogProvider) {
    datadogProvider = new datadog.Provider('datadog', {
      apiUrl: 'https://api.us5.datadoghq.com/',
      apiKey: getSecretValue('datadog-api-key'),
      appKey: getSecretValue('datadog-app-key'),
      validate: String(false),
    });
  }
  return datadogProvider;
}
