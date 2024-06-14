import { isLocal } from '@tw/constants';
import * as fs from 'fs';

let secrets;
export const secretsPath = '/etc/secrets/store';

function loadSecrets() {
  if (process.env.TW_SECRETS) {
    try {
      return JSON.parse(process.env.TW_SECRETS);
    } catch {}
  }

  if (fs.existsSync(secretsPath)) {
    const data = fs.readFileSync(secretsPath).toString();
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse secrets', e, data);
      throw e;
    }
  }

  return {};
}

export function getSecret(key: string): any {
  secrets = secrets || loadSecrets();
  if (isLocal) {
    return process.env[key] || secrets[key];
  }
  return secrets[key] || process.env[key];
}
