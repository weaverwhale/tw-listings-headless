import { runProcess } from './runProcess';

let idTokenCache, accessTokenCache;

export async function getIdentityToken() {
  if (idTokenCache) return idTokenCache;
  const token = (
    await runProcess({
      log: false,
      command: 'gcloud',
      commandArgs: ['auth', 'print-identity-token'],
    })
  ).stdout.trim();
  if (!token) {
    throw Error("Can't get token from gcloud!");
  }
  idTokenCache = token;
  return token;
}

export async function getAccessToken() {
  if (accessTokenCache) return accessTokenCache;
  const token = (
    await runProcess({
      log: false,
      command: 'gcloud',
      commandArgs: ['auth', 'print-access-token'],
    })
  ).stdout.trim();
  if (!token) {
    throw Error("Can't get token from gcloud!");
  }
  accessTokenCache = token;
  return token;
}
