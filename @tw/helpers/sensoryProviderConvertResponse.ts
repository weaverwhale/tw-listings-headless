import { ServicesIds } from '@tw/types/module/services';
import {
  Integration,
  Provider,
  ProviderCredential,
} from '@tw/types/module/services/account-manager';

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
