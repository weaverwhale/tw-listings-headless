import { getStorageClient } from './client';

export async function downloadFile(
  bucketName: string,
  name: string,
  additionalOptions?: { forceCloud?: boolean; generation?: number }
) {
  const client = getStorageClient({ forceCloud: additionalOptions?.forceCloud });
  const dataAsString = (
    await client
      .bucket(bucketName)
      .file(name, { generation: additionalOptions?.generation })
      .download()
  )[0].toString();
  const data = JSON.parse(dataAsString);
  return data;
}
