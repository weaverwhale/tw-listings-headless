import { firestore } from 'firebase-admin';

import { MediaSource } from '@tw/types';

export const saveMediaItem = async (
  shop: string,
  fileName: string,
  fileType: string,
  publicUrl: string,
  source: MediaSource,
  serviceId: string,
  fileSize: string,
  docIdToUpdate: string,
  customId?: string,
  metadata?: any
) => {
  const now = firestore.FieldValue.serverTimestamp();
  const objToSave: any = {
    name: fileName,
    media_type: fileType,
    url: publicUrl,
    updated_at: now,
    serviceId: serviceId,
    fileSize: fileSize,
    source: source,
    customId: customId ? customId : null,
  };
  if (metadata?.tags) {
    objToSave.tags = metadata?.tags;
  }
  await firestore()
    .collection('shops')
    .doc(shop)
    .collection('media_assets')
    .doc(docIdToUpdate)
    .set(objToSave, { merge: true });
};
