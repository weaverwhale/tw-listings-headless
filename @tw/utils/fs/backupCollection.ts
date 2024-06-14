import { firestore } from 'firebase-admin';
import { saveToBucket } from '../gcs';
import { SaveOptions } from '@google-cloud/storage';
import { logger } from '../logger';
import pLimit from 'p-limit';

export const backupFsCollection = async (
  collectionName: string,
  includeSubCollections: boolean = true
) => {
  logger.info(
    `Backing up collection ${collectionName} to GCS, includeSubCollections: ${includeSubCollections}`
  );
  const data: { [docId: string]: any } = {};
  try {
    const collectionSnapshot = await firestore().collection(collectionName).get();
    const limit = pLimit(100);
    await Promise.all(
      collectionSnapshot.docs.map(async (doc) =>
        limit(async () => {
          const docData = doc.data();

          if (includeSubCollections) {
            const subCollectionRef = await doc.ref.listCollections();
            const subCollections = {};
            await Promise.all(
              subCollectionRef.map(async (sub) => {
                const subCollectionData: { [subdocId: string]: any } = {};
                const subCollectionSnapshot = await sub.get();
                subCollectionSnapshot.forEach((subDoc) => {
                  subCollectionData[subDoc.id] = subDoc.data();
                });
                subCollections[sub.id] = subCollectionData;
              })
            );
            docData.subCollections = subCollections;
          }

          data[doc.id] = docData;
        })
      )
    );

    const options: SaveOptions = {
      contentType: 'application/json',
    };
    await saveToBucket(
      `${collectionName}-docs-backups-${process.env.PROJECT_ID}`,
      `${collectionName}.json`,
      data,
      options
    );
    logger.info(`Backup of collection ${collectionName} to GCS completed`);
  } catch (error) {
    logger.error(`Error while backing up collection ${collectionName} to GCS`, error);
    throw error;
  }
};
