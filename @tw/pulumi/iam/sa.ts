import * as gcp from '@pulumi/gcp';
import { getUniqueNameInProject } from '../utils';
import { createUUID } from '../utils/uuid';

export type GCPServiceAccount = gcp.serviceaccount.Account & {
  account_id: string;
  uuid: string;
};

export function createIamServiceAccount(args: { accountId: string; name?: string }) {
  const { name } = args;
  const fullAccountId = (getUniqueNameInProject(args.accountId, '-', true) as string).substring(
    0,
    30
  );
  // valid account regex: "^[a-z](?:[-a-z0-9]{4,28}[a-z0-9])$"
  const accountId = fullAccountId.replace(/[^a-z0-9]$/, '');

  const serviceAccount = new gcp.serviceaccount.Account(name || args.accountId, {
    accountId,
    displayName: name,
  }) as GCPServiceAccount;

  serviceAccount.account_id = accountId;
  serviceAccount.uuid = createUUID(accountId);
  return serviceAccount;
}
