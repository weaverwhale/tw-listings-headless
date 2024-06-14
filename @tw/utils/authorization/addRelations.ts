import { type OnlyStringKeys, type OnlyOne } from '@tw/types';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { array2list, camel } from '../string';
import { logger } from '../logger';
import { TW_SCHEMA, type TWSchema } from './schema';
import { validateRelations } from './validate';
import { AxiosResponse } from 'axios';

const _test: any = {};

export type RelationParams = {
  subjectType: OnlyStringKeys<TWSchema>;
  resourceType: OnlyStringKeys<TWSchema>;
  relation: string;
} & OnlyOne<{
  resourceId: string;
  resourceIds: string[];
}> &
  OnlyOne<{
    subjectId: string;
    subjectIds: string[];
  }>;

export class RelationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

async function sendRequest(params: RelationParams, endpoint = 'relation') {
  try {
    return await callServiceEndpoint('charif', endpoint, params);
  } catch (e) {
    logger.error('Error adding relation', { ...e, params });
    throw e;
  }
}

async function sendAddRequest(params: RelationParams) {
  const errors = validateRelations(params);
  if (errors.length > 0) {
    throw new RelationValidationError(errors.join(', '));
  }
  return await sendRequest(params, 'relation/add');
}
_test.sendAddRequest = sendAddRequest;

async function sendRemoveRequest(params: RelationParams) {
  const errors = validateRelations(params);
  if (errors.length > 0) {
    throw new RelationValidationError(errors.join(', '));
  }
  return await sendRequest(params, 'relation/remove');
}

// So if ResourceType = 'account' and SubjectType = 'user' | 'group'
// it will give you:
// {
//   accountId?: string;
//   accountIds?: string[];
//   userId?: string;
//   groupId?: string;
//   userIds?: string[];
//   groupIds?: string[];
// }
type BuildParams<ResourceType extends string, SubjectType extends string> = OnlyOne<
  {
    [K in ResourceType as `${K}Id`]: string;
  } & {
    [K in ResourceType as `${K}Ids`]: string[];
  }
> &
  OnlyOne<
    {
      [K in SubjectType as `${K}Id`]: string;
    } & {
      [K in SubjectType as `${K}Ids`]: string[];
    }
  >;

function buildSender<ParamsType>(sendFn: (params: RelationParams) => Promise<AxiosResponse>) {
  return function _send(
    resourceType: string,
    relation: string,
    validSubjectTypes: string | string[]
  ) {
    return async function (params: ParamsType) {
      if (typeof validSubjectTypes === 'string') {
        validSubjectTypes = [validSubjectTypes];
      }
      const whichSubjType = validSubjectTypes.find(
        (subjType) => params[`${subjType}Id`] || params[`${subjType}Ids`]
      );
      if (!whichSubjType || !validSubjectTypes.includes(whichSubjType)) {
        throw new RelationValidationError(
          `Invalid subject type ${whichSubjType}, expected one of: ${array2list(validSubjectTypes)}`
        );
      }
      const subjectType = whichSubjType;
      const subjectId = params[`${subjectType}Id`];
      let subjectIds = params[`${subjectType}Ids`];
      if (!subjectId) {
        subjectIds = [...(subjectIds || []), subjectId].filter(Boolean);
      }
      const resourceId = params[`${resourceType}Id`];
      let resourceIds = params[`${resourceType}Ids`];
      if (!resourceId) {
        resourceIds = [...(resourceIds || []), resourceId].filter(Boolean);
      }
      await sendFn({
        subjectType: subjectType as OnlyStringKeys<TWSchema>,
        resourceType: resourceType as OnlyStringKeys<TWSchema>,
        relation,
        ...(subjectId ? { subjectId } : { subjectIds }),
        ...(resourceId ? { resourceId } : { resourceIds }),
      });
    };
  };
}

function buildAdder<T>(...args: [string, string, string | string[]]) {
  return buildSender<T>(sendAddRequest)(...args);
}
_test.buildAdder = buildAdder;

function buildRemover<T>(...args: [string, string, string | string[]]) {
  return buildSender(sendRemoveRequest)(...args);
}
_test.buildRemover = buildRemover;

// ADDERS
//
// take the form `add${Relation}To${ResourceType}`
// e.g. addMemberToAccount
// NOT addUserToAccount (user is a subject type, not a relation)

// Adding multiple subjects to the same resource:
//
// e.g. addMemberToAccount({ accountId: '123', userIds: ['456', '789'] })

// Account

// addAdminToAccount({ accountId: '123', userId: '456' })
// addAdminToAccount({ accountId: '123', groupId: '456' }) // all members of group 456 will be admins of account 123
export type AddAdminToAccountParams = BuildParams<'account', 'user' | 'group'>;
export const addAdminToAccount = buildAdder<AddAdminToAccountParams>('account', 'admin', [
  'user',
  'group',
]);
export const removeAdminFromAccount = buildRemover<AddAdminToAccountParams>('account', 'admin', [
  'user',
  'group',
]);

export type AddDataViewerToAccountParams = BuildParams<'account', 'user' | 'group'>;
export const addDataViewerToAccount = buildAdder<AddDataViewerToAccountParams>(
  'account',
  'data_viewer',
  ['user', 'group']
);
export const removeDataViewerFromAccount = buildRemover<AddDataViewerToAccountParams>(
  'account',
  'data_viewer',
  ['user', 'group']
);

export type AddMemberToAccountParams = BuildParams<'account', 'user' | 'group'>;
export const addMemberToAccount = buildAdder<AddMemberToAccountParams>('account', 'member', [
  'user',
  'group',
]);
export const removeMemberFromAccount = buildRemover<AddMemberToAccountParams>('account', 'member', [
  'user',
  'group',
]);

// Group

export type AddMemberToGroupParams = BuildParams<'group', 'user'>;
export const addMemberToGroup = buildAdder<AddMemberToGroupParams>('group', 'member', 'user');
export const removeMemberFromGroup = buildRemover<AddMemberToGroupParams>(
  'group',
  'member',
  'user'
);

export type AddAdminToGroupParams = BuildParams<'group', 'user'>;
export const addAdminToGroup = buildAdder<AddAdminToGroupParams>('group', 'admin', 'user');
export const removeAdminFromGroup = buildRemover<AddAdminToGroupParams>('group', 'admin', 'user');

// Provider

export type AddAdminToProviderParams = BuildParams<'provider', 'user' | 'group'>;
export const addAdminToProvider = buildAdder<AddAdminToProviderParams>('provider', 'admin', [
  'user',
  'group',
]);
export const removeAdminFromProvider = buildRemover<AddAdminToProviderParams>('provider', 'admin', [
  'user',
  'group',
]);

export type AddDataViewerToProviderParams = BuildParams<'provider', 'user' | 'group'>;
export const addDataViewerToProvider = buildAdder<AddDataViewerToProviderParams>(
  'provider',
  'data_viewer',
  ['user', 'group']
);
export const removeDataViewerFromProvider = buildRemover<AddDataViewerToProviderParams>(
  'provider',
  'data_viewer',
  ['user', 'group']
);

export type AddProviderToAccountParams = BuildParams<'provider', 'account'>;
export const addProviderToAccount = buildAdder<AddProviderToAccountParams>(
  'provider',
  'account',
  'account'
);
export const removeProviderFromAccount = buildRemover<AddProviderToAccountParams>(
  'provider',
  'account',
  'account'
);

// Integration

export type AddIntegrationToAccountParams = BuildParams<'integration', 'account'>;
export const addIntegrationToAccount = buildAdder<AddIntegrationToAccountParams>(
  'integration',
  'account',
  'account'
);
export const removeIntegrationFromAccount = buildRemover<AddIntegrationToAccountParams>(
  'integration',
  'account',
  'account'
);

export type AddProviderToIntegrationParams = BuildParams<'integration', 'provider'>;
export const addProviderToIntegration = buildAdder<AddProviderToIntegrationParams>(
  'integration',
  'provider',
  'provider'
);
export const removeProviderFromIntegration = buildRemover<AddProviderToIntegrationParams>(
  'integration',
  'provider',
  'provider'
);

export type AddAdminToIntegrationParams = BuildParams<'integration', 'user' | 'group'>;
export const addAdminToIntegration = buildAdder<AddAdminToIntegrationParams>(
  'integration',
  'admin',
  ['user', 'group']
);
export const removeAdminFromIntegration = buildRemover<AddAdminToIntegrationParams>(
  'integration',
  'admin',
  ['user', 'group']
);

export type AddDataViewerToIntegrationParams = BuildParams<'integration', 'user' | 'group'>;
export const addDataViewerToIntegration = buildAdder<AddDataViewerToIntegrationParams>(
  'integration',
  'data_viewer',
  ['user', 'group']
);
export const removeDataViewerFromIntegration = buildRemover<AddDataViewerToIntegrationParams>(
  'integration',
  'data_viewer',
  ['user', 'group']
);

// Dashboard
// TODO: fix these they dont match the new product requirements

export type MakeDashboardPublicParams = BuildParams<'dashboard', 'account'>;
export const makeDashboardPublic = buildAdder<MakeDashboardPublicParams>(
  'dashboard',
  'viewer',
  'account'
);

export type MakeDashboardPrivateParams = BuildParams<'dashboard', 'account'>;
export const makeDashboardPrivate = buildRemover<MakeDashboardPrivateParams>(
  'dashboard',
  'viewer',
  'account'
);

export type AddAdminToDashboardParams = BuildParams<'dashboard', 'user'>;
export const addAdminToDashboard = buildAdder<AddAdminToDashboardParams>(
  'dashboard',
  'admin',
  'user'
);

export type AddEditorToDashboardParams = BuildParams<'dashboard', 'user'>;
export const addEditorToDashboard = buildAdder<AddEditorToDashboardParams>(
  'dashboard',
  'editor',
  'user'
);

export type AddViewerToDashboardParams = BuildParams<'dashboard', 'user'>;
export const addViewerToDashboard = buildAdder<AddViewerToDashboardParams>(
  'dashboard',
  'viewer',
  'user'
);

export { _test };
