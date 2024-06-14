import fetch from 'node-fetch';

import { SaveOptions } from '@google-cloud/storage';

import { getStorageClient } from './gcs/client';

export async function saveStreamToBucket<T = any>(
  bucketName: string,
  filename: string,
  url: T,
  options: SaveOptions
) {
  const storageClient = getStorageClient();
  // https://github.com/googleapis/google-cloud-node/issues/654
  if (process.env.IS_LOCAL) {
    options.validation = false;
  }
  const bucket = storageClient.bucket(bucketName);
  // @ts-ignore
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  await bucket.file(filename).save(buffer, options);
  return filename;
}
