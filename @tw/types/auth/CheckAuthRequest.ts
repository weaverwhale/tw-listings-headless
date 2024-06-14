import { AuthType } from '.';
import { ServicesIds } from '../services';

export const sensoryIntegrationService = 'sensory-integrations';
export const sensoryCredentialService = 'sensory-credentials';
export const sensoryMaster = 'sensory-master';

export type CheckAuthRequest = {
  id?: string;
  serviceId: ServicesIds | typeof sensoryIntegrationService | typeof sensoryCredentialService | typeof sensoryMaster;
  accountIds: string | string[];
  type?: AuthType;
  userId?: string;
  fromAccountId?: string;
};
