export const belongsToOneAccount = 'relation account: account' as const;

export const userOrGroupMember = 'user | group#member' as const;

export const hasManyAdmins = `relation admin: ${userOrGroupMember}` as const;

export const hasManyDataViewers = `relation data_viewer: ${userOrGroupMember}` as const;

export const adminCanManage = `permission manage = admin` as const;

export const accountManagerCanManage = `permission manage = account->manage` as const;

export const accountManagerOrAdminCanManage =
  `permission manage = account->manage + admin` as const;
