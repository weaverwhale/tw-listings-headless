import {
  addIntegrationToAccount,
  addProviderToAccount,
  addProviderToIntegration,
} from './addRelations';

export type AddNewIntegrationParams = {
  accountId: string;
  providerId: string;
  integrationId: string;
};

export const addNewIntegration = async function _addNewIntegration(
  params: AddNewIntegrationParams
) {
  // the order doesnt matter here, so we can use Promise.all
  await Promise.all([
    addIntegrationToAccount({
      accountId: params.accountId,
      integrationId: params.integrationId,
    }),
    addProviderToAccount({
      accountId: params.accountId,
      providerId: params.providerId,
    }),
    addProviderToIntegration({
      integrationId: params.integrationId,
      providerId: params.providerId,
    }),
  ]);
};
