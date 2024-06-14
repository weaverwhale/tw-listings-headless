import * as postgresql from '@pulumi/postgresql';
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { SqlDatabaseInstance } from '../sql';

const providers: Record<string, postgresql.Provider> = {};

export function getPostgresqlProvider(args: {
  instance: SqlDatabaseInstance;
  user: gcp.sql.User;
  database?: pulumi.Input<string>;
}) {
  const { database } = args;
  const name = args.instance.instance_name;
  if (providers[name]) {
    return providers[name];
  }
  const provider = new postgresql.Provider(name, {
    host: args.instance.ipAddresses[0].ipAddress,
    username: args.user.name,
    password: args.user.password,
    database,
  });
  providers[name] = provider;
  return provider;
}
