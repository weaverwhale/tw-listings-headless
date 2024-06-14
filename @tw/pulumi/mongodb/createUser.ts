import * as mongodbatlas from '@pulumi/mongodbatlas';
import { createPassword } from '../security';
import { getStackReference } from '../utils';
import { getConfigs } from '../utils/getConfigs';
import { getMongoAtlasProvider } from './provider';

export function createMongoDbUser() {
  const { serviceId, projectId } = getConfigs();
  const globalInfraRef = getStackReference(`infra`, projectId);
  const userPassword = createPassword({ name: 'mongo-db-user-password', special: false });

  const mongoDbUser = new mongodbatlas.DatabaseUser(
    'mongo-db-user',
    {
      projectId: globalInfraRef.getOutput('mongoDBProjectId'),
      roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }],
      username: `${serviceId}-user`,
      authDatabaseName: 'admin',
      password: userPassword.result,
    },
    {
      provider: getMongoAtlasProvider(),
    }
  );
  return mongoDbUser;
}
