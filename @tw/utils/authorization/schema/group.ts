import { accountManagerCanManage } from './common';

export default `
definition group {
  relation account: account
  relation member: user

  permission manage = account->manage
}
`;
