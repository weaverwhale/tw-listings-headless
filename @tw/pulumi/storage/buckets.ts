import * as gcp from '@pulumi/gcp';
import { getConfigs } from '../utils';

export function createStorageBucket(name: string, opts: Partial<gcp.storage.BucketArgs> = {}) {
  return new gcp.storage.Bucket(name, {
    location: getConfigs().location,
    versioning: {
      enabled: true,
    },
    ...opts,
  });
}
