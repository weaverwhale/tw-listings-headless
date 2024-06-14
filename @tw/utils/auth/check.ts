import { CheckAuthRequest, CheckAuthResponse, FirebaseUser, HydraApp } from '@tw/types';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { getAuthType } from './utils';
import { logger } from '../logger';
import { ServicesIdsWithSensory } from '../express';

export async function checkUserAccessToResource(
  user: FirebaseUser | HydraApp | undefined,
  serviceId: ServicesIdsWithSensory,
  accountIds: string | string[],
  options?: { ignoreAdmin?: boolean }
): Promise<CheckAuthResponse> {
  const { ignoreAdmin } = options || {};
  if (!user) return { result: true };
  const accounts = (Array.isArray(accountIds) ? accountIds : [accountIds]).filter(Boolean);
  if (!accounts.length || !serviceId) {
    logger.warn('denied: ', { serviceId, accountIds });
    return { result: false, message: 'Invalid Resource' };
  }
  if (user['admin'] && !(ignoreAdmin || Boolean(process.env.IGNORE_ADMIN))) {
    return { result: true };
  }
  const authType = getAuthType(user);
  const body: CheckAuthRequest = {
    type: 'user',
    serviceId,
    accountIds,
  };
  body.id = user['sub'];
  try {
    if (authType === 'app') {
      body.fromAccountId = user['ext']['claims']['accountId'];
    }
  } catch {
    // for auth0
    body.id = user['azp'];
    body.type = 'app';
  }
  try {
    const authResp = await callServiceEndpoint<CheckAuthResponse>('users', 'auth/check', body, {
      method: 'GET',
      log: false,
    });
    return authResp.data;
  } catch (e) {
    const authResp = e.response;
    if (authResp?.data && authResp.status === 403) {
      return authResp.data;
    }
    logger.error('checkUserAccessToResource', e);
    throw e;
  }
}
