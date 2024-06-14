import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createUUID } from '../utils/uuid';
import { GCPServiceAccount } from './sa';

export function addRolesToServiceAccount(
  serviceAccount: GCPServiceAccount,
  projectId,
  roles: string[],
  suffix?: string
) {
  addRolesToServiceAccountEmail(
    serviceAccount.email,
    projectId,
    roles,
    suffix,
    serviceAccount.uuid
  );
}

export function addRolesToServiceAccountEmail(
  serviceAccountEmail: pulumi.Input<string>,
  projectId,
  roles: string[],
  suffix?: string,
  uuid?: string
) {
  for (const role of roles) {
    const roleAbbreviation = role
      .replace('/', '-')
      .replace('.', '-')
      .toLowerCase()
      .split('-')
      .map((word) => word[0] + word.slice(-1))
      .join('');

    const name = roleToName(role);
    const projectUUID = createUUID(projectId);
    new gcp.projects.IAMMember(
      `${name}-${projectId}${suffix || uuid}`,
      {
        project: projectId,
        member: pulumi.interpolate`serviceAccount:${serviceAccountEmail}`,
        role: role,
      },
      {
        aliases: [
          {
            name: `${roleAbbreviation}-${projectUUID}${suffix || uuid}`,
          },
        ],
      }
    );
  }
}

export function addRolesToServiceAccountOrg(args: {
  serviceAccount: GCPServiceAccount;
  orgId?: string;
  roles: string[];
  suffix?: string;
}) {
  const { serviceAccount, orgId = '193415757381', roles, suffix } = args;
  addRolesToServiceAccountEmailOrg({
    serviceAccountEmail: serviceAccount.email,
    orgId,
    roles,
    suffix,
    uuid: serviceAccount.uuid,
  });
}

export function addRolesToServiceAccountEmailOrg(args: {
  serviceAccountEmail: pulumi.Input<string>;
  orgId?: string;
  roles: string[];
  suffix?: string;
  uuid?: string;
}) {
  const { serviceAccountEmail, orgId = '193415757381', roles, suffix, uuid } = args;
  for (const role of roles) {
    const name = roleToName(role);
    new gcp.organizations.IAMMember(`${name}-${orgId}${suffix || uuid}`, {
      orgId: orgId,
      member: pulumi.interpolate`serviceAccount:${serviceAccountEmail}`,
      role: role,
    });
  }
}

function roleToName(role: string) {
  return role.replaceAll('/', '-').replaceAll('.', '-').toLowerCase();
}
