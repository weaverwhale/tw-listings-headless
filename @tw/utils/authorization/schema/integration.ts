import { type Definition } from '../types';
import {
  accountManagerOrAdminCanManage,
  belongsToOneAccount,
  hasManyAdmins,
  hasManyDataViewers,
} from './common';

export default `
definition integration {
  ${belongsToOneAccount}
  ${hasManyAdmins}
  ${hasManyDataViewers}
  relation provider: provider
  relation business_unit: business_unit

  permission manage = admin + account->manage + provider->manage + business_unit->manage
  permission view_data = account->view_data + provider->view_data + business_unit->view_data + manage + data_viewer
}
`;
