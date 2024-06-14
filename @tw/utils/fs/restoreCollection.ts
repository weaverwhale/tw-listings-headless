import { firestore } from 'firebase-admin';
import { logger } from '../logger';

export const restoreFsCollection = async (
  collectionName: string,
  restoredCollectionData: {
    [docId: string]: { [key: string]: any };
  }
) => {
  try {
    const batchArray: firestore.WriteBatch[] = [];
    const BATCH_SIZE = 500; // Firestore batch write limit
    let operationCounter = 0;
    let batchIndex = 0;
    batchArray.push(firestore().batch());

    const promises = [];

    for (const [docId, docData] of Object.entries(restoredCollectionData)) {
      const docRef = firestore().collection(collectionName).doc(docId);
      const { subCollections, ...rest } = docData as any;
      batchArray[batchIndex].set(docRef, rest, { merge: true });
      operationCounter++;

      if (subCollections) {
        for (const [subCollectionName, subDocs] of Object.entries(subCollections)) {
          for (const [subDocId, subDocData] of Object.entries(subDocs)) {
            const subDocRef = docRef.collection(subCollectionName).doc(subDocId);
            batchArray[batchIndex].set(subDocRef, subDocData, { merge: true });
            operationCounter++;

            if (operationCounter >= BATCH_SIZE) {
              batchArray.push(firestore().batch());
              batchIndex++;
              operationCounter = 0;
            }
          }
        }
      }
    }

    batchArray.forEach((batch) => promises.push(batch.commit()));
    await Promise.all(promises);

    logger.info(`Firestore collection restored successfully ${collectionName}.`);
  } catch (error) {
    logger.error('Error while restoring Firestore collection', { error, collectionName });
    throw new Error('Error while restoring Firestore collection');
  }
};
