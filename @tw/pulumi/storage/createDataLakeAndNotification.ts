import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createStorageNotification } from './createStorageNotification';

export function createDataLakeAndNotification(bucketName: string, location: string) {
  const dataLake = new gcp.storage.Bucket(bucketName, {
    location: location,
    name: bucketName,
  });

  const onFinalizeTopic = new gcp.pubsub.Topic(`${bucketName}-object-on-finalize`, {
    name: pulumi.interpolate`${dataLake.name}-object-on-finalize`,
  });

  createStorageNotification(bucketName, onFinalizeTopic);

  return {
    dataLake,
    onFinalizeTopic,
  };
}
