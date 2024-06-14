import { BucketOptions, SaveOptions, StorageOptions } from '@google-cloud/storage';
import { getStorageClient } from './client';

export async function saveToBucket<T>(
  bucketName: string,
  filename: string,
  data: T,
  options: SaveOptions,
  bucketOptions?: BucketOptions,
  additionalOptions?: { forceCloud: boolean },
  storageOptions?: Partial<StorageOptions>
) {
  const storageClient = getStorageClient({
    forceCloud: additionalOptions?.forceCloud,
    storageOptions,
  });
  // https://github.com/googleapis/google-cloud-node/issues/654
  if (process.env.IS_LOCAL) {
    options.validation = false;
  }
  const bucket = storageClient.bucket(bucketName, bucketOptions);
  const stringData = typeof(data) === 'string' ? data : JSON.stringify(data);
  return await bucket.file(filename).save(stringData, {
    // we want to support upload in 8 KB/s (1 Kb/s very slow), so:
    timeout: 120000 /* 120 seconds per chunk */,
    // chunkSize: 1024 * 1024 /* 1MB per chunk */,

    ...options,
  });
}
