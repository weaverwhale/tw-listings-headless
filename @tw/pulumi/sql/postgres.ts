import * as gcp from '@pulumi/gcp';
import { isProduction } from '../constants';
import { monitoringState } from '../monitoring/state';
import { createLabels, getNetworkId, getUniqueNameInProject } from '../utils';

import { getConfigs } from '../utils/getConfigs';
import { createDatadogSqlMonitor } from '../datadog/sqlMonitor';

export type SqlDatabaseInstance = gcp.sql.DatabaseInstance & {
  instance_name: string;
};

const MB = 1024;

export function createPostgresInstance(args: {
  cpu?: number;
  memoryGb: number;
  nonProdRatio?: number;
  name?: string;
  enableInsights?: boolean;
  maxConnections?: string;
  version?: '13' | '14';
  availabilityType?: 'ZONAL' | 'REGIONAL';
  pointInTimeRecoveryEnabled?: boolean;
  databaseFlags?: gcp.types.input.sql.DatabaseInstanceSettingsDatabaseFlag[];
  backup?: boolean;
  retainedBackups?: number;
  databaseInstanceArgs?: Partial<gcp.sql.DatabaseInstanceArgs>;
  monitor?: boolean;
}) {
  const { serviceId, location } = getConfigs();
  const {
    cpu,
    memoryGb,
    nonProdRatio = 4,
    enableInsights,
    maxConnections,
    version = '14',
    databaseFlags = [],
    backup = isProduction,
    retainedBackups = 7,
    monitor = false,
  } = args;
  const availabilityType = isProduction ? args.availabilityType || 'ZONAL' : 'ZONAL';
  const pointInTimeRecoveryEnabled =
    args.pointInTimeRecoveryEnabled || availabilityType === 'REGIONAL';
  let tier = `db-custom-${cpu}-${memoryGb * MB}`;
  if (maxConnections) {
    databaseFlags.push({ name: 'max_connections', value: maxConnections });
  }

  databaseFlags.push({ name: 'track_activity_query_size', value: '4096' });
  databaseFlags.push({ name: 'pg_stat_statements.track', value: 'all' });
  databaseFlags.push({ name: 'pg_stat_statements.max', value: '10000' });
  databaseFlags.push({ name: 'pg_stat_statements.track_utility', value: 'off' });
  databaseFlags.push({ name: 'track_io_timing', value: 'on' });

  if (!isProduction) {
    // cpu must be 1 or an even number less than or equal to 96.
    let cpus = Math.round(Math.max(cpu / nonProdRatio, 1));
    cpus = cpus % 2 === 0 || cpus === 1 ? cpus : cpus + 1;
    tier = `db-custom-${cpus}-${Math.max(memoryGb / nonProdRatio, 3.75) * MB}`;
  }
  const name = getUniqueNameInProject(args.name || `${serviceId}-instance`) as string;
  const sqlInstance = new gcp.sql.DatabaseInstance(
    name as string,
    {
      databaseVersion: `POSTGRES_${version}`,
      name,
      settings: {
        deletionProtectionEnabled: true,
        userLabels: { ...createLabels() },
        tier,
        edition: 'ENTERPRISE',
        backupConfiguration: backup
          ? {
              backupRetentionSettings: { retainedBackups, retentionUnit: 'COUNT' },
              binaryLogEnabled: false,
              enabled: true,
              location: 'us',
              pointInTimeRecoveryEnabled,
              startTime: '21:00',
              transactionLogRetentionDays: 7,
            }
          : null,
        ipConfiguration: {
          ipv4Enabled: false,
          privateNetwork: getNetworkId('app'),
        },
        availabilityType,
        databaseFlags,
        insightsConfig: enableInsights
          ? {
              queryInsightsEnabled: true,
              recordApplicationTags: true,
            }
          : null,
      },
      region: location,
      deletionProtection: true,
      ...args.databaseInstanceArgs,
    },
    { aliases: [{ name: 'sql-instance' }], protect: true }
  ) as SqlDatabaseInstance;
  sqlInstance.instance_name = name;
  // @ts-ignore
  // TODO: this removes to dependency on the instance for anyone using this field
  monitoringState.sql.enabled = true;
  if (monitor) createDatadogSqlMonitor({ instance: sqlInstance, name });
  return sqlInstance;
}
