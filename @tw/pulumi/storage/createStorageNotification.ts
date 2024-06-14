import * as gcp from '@pulumi/gcp';

export function createStorageNotification(
  bucketName: string,
  topic: gcp.pubsub.Topic,
  objectNamePrefix?: string
) {
  let gcsAccount;
  if (!process.env.IS_LOCAL) {
    gcsAccount = gcp.storage.getProjectServiceAccount({});
  }
  
  const topicIAMBindingName = objectNamePrefix? `${bucketName}-${objectNamePrefix}-binding` : `${bucketName}-binding`;
  const binding = new gcp.pubsub.TopicIAMBinding(topicIAMBindingName, {
    topic: topic.id,
    role: 'roles/pubsub.publisher',
    members: [
      gcsAccount
        ? gcsAccount.then((gcsAccount) => `serviceAccount:${gcsAccount.emailAddress}`)
        : 'u@d.io',
    ],
  });

  const notificationOptions: gcp.storage.NotificationArgs = {
    bucket: bucketName,
    payloadFormat: 'JSON_API_V1',
    topic: topic.id,
    eventTypes: ['OBJECT_FINALIZE'],
  };
  if (objectNamePrefix) {
    notificationOptions.objectNamePrefix = objectNamePrefix;
  }
  const notificationName = objectNamePrefix? `${bucketName}-${objectNamePrefix}-datalake-notification` : `${bucketName}-datalake-notification`;
  new gcp.storage.Notification(notificationName, notificationOptions, {
    dependsOn: [binding],
  });
}
