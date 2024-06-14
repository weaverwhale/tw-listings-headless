import {
  accountManagerOrAdminCanManage,
  belongsToOneAccount,
  hasManyAdmins,
  hasManyDataViewers,
} from './common';

export default `
definition business_unit {
  ${belongsToOneAccount}
  ${hasManyAdmins}
  ${hasManyDataViewers}

  ${accountManagerOrAdminCanManage}
  permission view_data = account->view_data + admin + data_viewer
}
`;
