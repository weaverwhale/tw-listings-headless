import { type Definition } from '../types';
import { userOrGroupMember, adminCanManage } from './common';

export default `
definition account {
  relation admin: user
  relation data_viewer: ${userOrGroupMember}
  relation member: user

  ${adminCanManage}
  permission view_data = manage + data_viewer
  permission view_dashboards = view_data + member
}
`;
