import * as gcp from '@pulumi/gcp';
import * as kubernetes from '@pulumi/kubernetes';
import { getConfigs } from '../utils';
import { toJSONOutput } from '../pulumi-utils';
import * as postgresql from '@pulumi/postgresql';
import { getK8sProvider } from '../k8s';
import { getPostgresqlProvider } from '../postgresql';
import { SqlDatabaseInstance } from '../sql';
import { createPassword } from '../security';

const sqlUsers: Record<string, gcp.sql.User> = {};

const instances: Record<string, SqlDatabaseInstance> = {};

export function createDatadogSqlMonitor(args: { instance: SqlDatabaseInstance; name: string }) {
  const { instance, name } = args;
  instances[name] = instance;
  const { projectId } = getConfigs();
  const provider = getK8sProvider({ cluster: 'knative-cluster', namespace: 'datadog' });
  const userPassword = createPassword({ name: `${name}-datadog-sql-pass` });
  const sqlUser = new gcp.sql.User(`${name}-datadog-sql-user`, {
    instance: instance.name,
    name: `datadog`,
    password: userPassword.result,
  });
  sqlUsers[name] = sqlUser;
  const host = instance.ipAddresses[0].ipAddress;
  const postgresqlProvider = getPostgresqlProvider({
    instance,
    user: sqlUser,
    database: 'postgres',
  });
  new postgresql.Extension(
    `${name}-pg_stat_statements`,
    {
      name: 'pg_stat_statements',
    },
    { provider: postgresqlProvider, deleteBeforeReplace: true }
  );

  createDatadogPostgresqlSchema({
    database: 'postgres',
    instanceName: name,
  });

  new kubernetes.core.v1.Service(
    name,
    {
      metadata: {
        name: `${name}-datadog-sql`,
        labels: {
          'tags.datadoghq.com/env': projectId,
          'tags.datadoghq.com/service': name,
          'pulumi.com/skipAwait': 'true',
        },
        annotations: {
          'pulumi.com/skipAwait': 'true',
          'ad.datadoghq.com/service.check_names': '["postgres"]',
          'ad.datadoghq.com/service.init_configs': '[{}]',
          'ad.datadoghq.com/service.instances': toJSONOutput([
            {
              dbm: true,
              host,
              port: 5432,
              username: 'datadog',
              password: userPassword.result,
              gcp: { project_id: projectId, instance_id: instance.id },
            },
          ]),
        },
      },
      spec: { ports: [{ port: 5432, protocol: 'TCP', targetPort: 5432, name: 'postgres' }] },
    },
    { provider }
  );
}

export function createDatadogPostgresqlSchema(args: { database: string; instanceName: string }) {
  const { database, instanceName } = args;

  const user = sqlUsers[instanceName];
  const instance = instances[instanceName];
  if (!instance) return;
  const provider = getPostgresqlProvider({
    instance: instance,
    user,
    database,
  });
  new postgresql.Schema(
    `${instanceName}-${database}-datadog`,
    {
      name: 'datadog',
      database,
    },
    { provider }
  );
}
