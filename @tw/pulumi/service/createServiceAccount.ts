import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { getConfigs } from '../utils';
import { addRolesToServiceAccount } from '../iam';
import { GCPServiceAccount, createIamServiceAccount } from '../iam/sa';

let serviceAccount: GCPServiceAccount;

export function createServiceAccount(args?: {
  name?: string;
  roles?: string[];
  addDefault?: boolean;
  suffix?: string;
}) {
  const { projectId, serviceId, isAService } = getConfigs();
  const { roles = [], name = serviceId, addDefault = true, suffix = '' } = args || {};
  const accountId = `${isAService ? 'srv-' : ''}${name}`;

  serviceAccount = createIamServiceAccount({ name, accountId });
  const defaultRoles = [`projects/${projectId}/roles/defaultServiceAccount`];

  const rolesToApply = [...roles, ...(addDefault ? defaultRoles : [])];

  if (rolesToApply.length) {
    addRolesToServiceAccount(serviceAccount, projectId, rolesToApply, suffix);
  }
  if (addDefault) {
    new gcp.serviceaccount.IAMBinding(`${name}-bind-act-as`, {
      serviceAccountId: serviceAccount.id,
      role: 'roles/iam.serviceAccountUser',
      members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
    });
  }
  return { serviceAccount };
}

export function k8sGetGCPServiceAccount() {
  return serviceAccount;
}
