import * as mongodbatlas from '@pulumi/mongodbatlas';
import { getSecretValue } from '../secrets';

let mongoAtlasProvider;

export function getMongoAtlasProvider() {
  if (!mongoAtlasProvider) {
    mongoAtlasProvider = new mongodbatlas.Provider('mongodbatlas', {
      privateKey: getSecretValue('mongodb-atlas-private-key'),
      publicKey: getSecretValue('mongodb-atlas-public-key'),
    });
  }
  return mongoAtlasProvider;
}
