import { appDomain, isProd, serviceId } from './environments';

export const integrationConnectedRedirectUrl = (success: boolean) =>
  `https://${appDomain}?integrationConnected=${success}&service-id=${serviceId}`;

export const trendsIntegrationConnectedRedirectUrl = (success: boolean) => {
  const integrationConnectedQueryParam = `integrationConnected=${success}&service-id=${serviceId}`;
  return isProd ? `https://${appDomain}/trends?${integrationConnectedQueryParam}` :
    `https://trends.triplewhale.com?${integrationConnectedQueryParam}`;
}