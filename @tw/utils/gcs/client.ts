import { Storage, StorageOptions } from '@google-cloud/storage';
import { isLocal } from '@tw/constants';

const storageClients: Record<string, Storage> = {};

export function getStorageClient(
  opts: { forceCloud?: boolean; storageOptions?: Partial<StorageOptions> } = {}
) {
  const forceCloud = opts.forceCloud || process.env.FORCE_CLOUD === 'true';
  const key = forceCloud ? 'forceCloud' : 'plain';
  if (!storageClients[key]) {
    const options: StorageOptions = {
      projectId: process.env.PROJECT_ID,
      ...opts.storageOptions,
    };
    if (isLocal && !forceCloud) options.apiEndpoint = 'http://localhost:8086';
    storageClients[key] = new Storage(options);
  }
  return storageClients[key];
}
