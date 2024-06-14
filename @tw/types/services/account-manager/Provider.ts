import { SensoryProvider } from '../../sensory';
import { ProviderCredential } from './ProviderCredential';
import { Integration } from './Integration';

export interface Provider extends SensoryProvider {
  id: string;
  name: string;
  version: number;
  choose_account: boolean;
  msp: boolean;
  integrations?: Integration[];
  credentials?: ProviderCredential[];
}
