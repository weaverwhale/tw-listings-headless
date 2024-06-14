import moment from 'moment-timezone';

import { File, GetFilesOptions } from '@google-cloud/storage';

import { getStorageClient } from './gcs/client';

/**
 *
 * @param filePrefix `data-lake-facebook-ads-shofifi/facebook-ads/ads-metrics/act_1005998533610085/2022/07/14/`
 */
export async function softReimport(
  bucketName: string,
  filePrefix: string,
  jobHour = '23',
  useDayLatest = false
): Promise<boolean> {
  const options: GetFilesOptions = {
    prefix: filePrefix + (useDayLatest ? '' : jobHour + '/'),
  };

  try {
    const storageClient = getStorageClient();
    const [files] = await storageClient.bucket(bucketName).getFiles(options);

    if (files.length) {
      // name of file is timestamp so is ordered chronologically
      const lastUpdatedFile = files.reduce(
        (acc, curr) => (acc.name.split('/').pop() > curr.name.split('/').pop() ? acc : curr),
        {
          name: '0',
        } as File
      );
      const filename = `${Date.now()}-softreimport-${(Math.random() + 1)
        .toString(35)
        .substring(10)}.json`;

      const destFileName = `${filePrefix}${jobHour}/${filename}`;
      await lastUpdatedFile.copy(storageClient.bucket(bucketName).file(destFileName), {
        contentType: 'application/json',
        contentEncoding: 'gzip',
        metadata: {
          ...lastUpdatedFile.metadata.metadata,
          jobUTCDate: moment().utc().format(),
        },
      });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}
