import crypto from 'crypto';

export function createUUID(name: string) {
  return crypto.createHash('shake256', { outputLength: 4 }).update(name).digest('hex');
}
