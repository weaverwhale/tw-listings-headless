import { Compute, GoogleAuth } from 'google-auth-library';
import { LRUCache } from 'lru-cache';

let authClient: GoogleAuth;

const idTokensCache = new LRUCache({
  ttl: 1000 * 55,
  max: 1000,
  ttlAutopurge: false,
  ignoreFetchAbort: true,
  allowStaleOnFetchAbort: true,
  fetchMethod: async (audience: string, _oldValue: any) => {
    if (!authClient) authClient = new GoogleAuth();
    const token = await ((await authClient.getClient()) as Compute).fetchIdToken(audience);
    return token;
  },
});

export async function getIdToken(audience: string): Promise<string> {
  const token: string = await idTokensCache.fetch(audience, { allowStale: false });
  return token;
}

export async function getGCPClientEmail(): Promise<string> {
  if (!authClient) authClient = new GoogleAuth();
  const credentials = await authClient.getCredentials();
  return credentials.client_email;
}

export function getAccessToken() {
  if (!authClient) authClient = new GoogleAuth();
  return authClient.getAccessToken();
}
