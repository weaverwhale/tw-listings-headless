import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { Table } from '@tw/pulumi-clickhouse';
import { createHash } from 'crypto';
import { ClickhouseTableArgs, KafkaArgs, createClickhouseTable } from './table';
import {
  clickhousePublicDatabase,
  clickhouseSystemDatabase,
  getPartitionBies,
  sonicUpdatedAtColumn,
  useCluster,
} from './utils';
import { createClickhouseView } from './view';
import { IntervalSpec } from '@temporalio/client';
import { getConfigs, getServiceImage } from '../utils';
import { toJSONOutput } from '../pulumi-utils';
import { ClickhouseColumn } from '@tw/types';
import { isProduction } from '../constants';
import { createStream } from './stream';
import { createLevel } from './level';
import { deploySaber } from '../sonic';

export type PipelineArgs = Partial<KafkaArgs> & {
  splitNumDays: number;
  interval?: IntervalSpec['every'];
  streamEngine?: 'kafka-connect' | 'clickhouse-table' | 'saber';
};

export type Mode = 'DIRECT' | 'STREAM' | 'STREAM_SPLIT' | 'LEVEL' | 'LEVEL_SPLIT';
export type ClickhousePipelineArgs = {
  name: string;
  mode?: Mode;
  tableArgs: Omit<Partial<ClickhouseTableArgs>, 'name'>;
  pipelineArgs?: Partial<PipelineArgs>;
  loading?: boolean;
};

export function createClickhousePipeline(args: ClickhousePipelineArgs) {
  const { tableArgs, pipelineArgs = {} as PipelineArgs, loading, name } = args;
  let { mode } = args;

  if (name.includes('_')) {
    throw new Error('Pipeline name must not contain underscores');
  }

  mode =
    mode ||
    (tableArgs.metadata?.dateField || tableArgs.metadata?.providerAccountField
      ? 'STREAM_SPLIT'
      : 'STREAM');

  tableArgs.columns = tableArgs.columns.concat([
    {
      name: sonicUpdatedAtColumn,
      type: 'DateTime',
    },
  ]);
  tableArgs.cluster = tableArgs.cluster || useCluster(tableArgs.engine);

  if (!tableArgs.partitionBies?.length && tableArgs.metadata) {
    tableArgs.partitionBies = getPartitionBies({
      metadata: tableArgs.metadata,
      columns: tableArgs.columns,
      allowTwoPartitionBies: mode === 'LEVEL_SPLIT',
    });
  }

  pipelineArgs.topic = pipelineArgs.topic || name;
  pipelineArgs.streamEngine = pipelineArgs.streamEngine || 'saber';

  const {
    engine,
    cluster,
    engineParams,
    indices,
    orderBies,
    metadata,
    columns,
    partitionBies,
    settings,
    comment,
    protect = isProduction,
  } = tableArgs;

  const { projectId } = getConfigs();

  if (mode === 'STREAM_SPLIT' || mode === 'LEVEL_SPLIT') {
    pipelineArgs.splitNumDays = pipelineArgs.splitNumDays ?? 1;
  }

  new gcp.storage.BucketObject(
    `${name}-table`,
    {
      bucket: `devops-${projectId}`,
      content: toJSONOutput(tableArgs),
      name: `sonic-tables/${name}.json`,
    },
    { retainOnDelete: true }
  );

  const table = createClickhouseTable({
    name,
    database: clickhouseSystemDatabase,
    cluster,
    engine,
    engineParams,
    indices,
    orderBies,
    partitionBies,
    metadata,
    columns,
    settings,
    comment,
    protect,
  });

  createMainView({
    table,
    tableName: table.name,
    name,
    mode,
    splitNumDays: pipelineArgs.splitNumDays,
    columns,
    metadata,
    cluster,
  });

  if (pipelineArgs.streamEngine === 'saber') {
    const nameUnderscore = name.replace(/-/g, '_');
    let tableName: string, oldTableName: string;
    if (mode === 'LEVEL') {
      tableName = nameUnderscore;
    } else if (mode === 'LEVEL_SPLIT') {
      tableName = `${nameUnderscore}__live`;
      oldTableName = nameUnderscore;
    } else if (mode === 'STREAM') {
      tableName = `${nameUnderscore}__old`;
    } else if (mode === 'STREAM_SPLIT') {
      tableName = nameUnderscore;
      oldTableName = `${nameUnderscore}__old`;
    }

    deploySaber({
      name: name,
      main: 'kafkaCHPipeline',
      concurrencyLimit: 40000,
      concurrencyTarget: 0,
      createK8sDeploymentArgs: {
        envs: {
          KAFKA_TOPIC_NAME: pipelineArgs.topic,
          CLICKHOUSE_TABLE_NAME: tableName,
          CLICKHOUSE_OLD_TABLE_NAME: oldTableName,
          CLICKHOUSE_DATABASE: clickhouseSystemDatabase,
          CLICKHOUSE_DATE_FIELD: metadata?.dateField,
          CLICKHOUSE_SPLIT_NUM_DAYS: pipelineArgs.splitNumDays,
          CLICKHOUSE_DIRECT: mode === 'LEVEL' || undefined,
        },
        maxReplicas: 20,
        podArgs: {
          k8sServiceAccountName: getConfigs().serviceId,
          image: getServiceImage({ serviceId: 'sonic', imageTag: 'latest', resolve: true }),
        },
      },
    });
  }

  if (mode === 'STREAM' || mode === 'STREAM_SPLIT') {
    createStream({
      name,
      mode,
      pipelineArgs,
      tableArgs,
      table,
    });
  } else if (mode === 'LEVEL' || mode === 'LEVEL_SPLIT') {
    createLevel({
      name,
      mode,
      database: clickhouseSystemDatabase,
      pipelineArgs,
      tableArgs,
    });
  }

  return { table };
}

function hashColumns(columns: ClickhouseColumn[]) {
  return createHash('sha256').update(JSON.stringify(columns)).digest('hex');
}

function getPartsQuery(args: {
  database: string;
  name: string;
  dateField?: string;
  splitNumDays?: number;
}) {
  const { name, database, dateField, splitNumDays } = args;
  const tableName = name.replace(/-/g, '_');
  const innerQuery = `
    with table as (
      select
          *
      from
          ${database}.${tableName}
      where
          _part in (
              SELECT
                  name,
              FROM
                  (
                      SELECT
                          partition,
                          name,
                          level,
                          ROW_NUMBER() OVER (
                              PARTITION BY partition
                              ORDER BY
                                  level DESC
                          ) AS rn
                      FROM
                          system.parts
                      where
                          active
                          and table = '${tableName}'
                          and database = '${database}'
                  )
              where
                  rn = 1
          )
    )`;

  if (dateField) {
    return `
      ${innerQuery}
      select
        *
      from
        table
      where
        ${dateField} < today() - ${splitNumDays + 1}
      union
      all
      select
        *
      from
      ${database}.${tableName} final
      where
        ${dateField} >= today() - ${splitNumDays + 1}`;
  }
  return `
    ${innerQuery}
    select
      *
    from
      table
    `;
}

function createMainView(args: {
  table: Table;
  tableName: pulumi.Input<string>;
  name: string;
  mode: string;
  splitNumDays?: number;
  columns: ClickhouseColumn[];
  metadata: { dateField?: string };
  cluster?: pulumi.Input<string>;
}) {
  const { tableName, name, mode, splitNumDays, columns, metadata, cluster, table } = args;

  let query = pulumi.interpolate`SELECT * FROM ${clickhouseSystemDatabase}.${tableName} FINAL`;

  if (mode === 'STREAM_SPLIT') {
    query = pulumi.interpolate`SELECT * FROM ${clickhouseSystemDatabase}.${tableName}`;
    if (metadata.dateField) {
      query = pulumi.interpolate`
      SELECT
        *
      FROM
      ${clickhouseSystemDatabase}.${tableName} FINAL
      WHERE
        ${metadata.dateField} >= today() - ${splitNumDays + 1}
    UNION ALL
      SELECT
        *
      FROM
      ${clickhouseSystemDatabase}.${tableName}
      WHERE
      ${metadata.dateField} <  today() - ${splitNumDays + 1}
    `;
    }
  }

  createClickhouseView({
    name: `${name}__parts`,
    database: clickhousePublicDatabase,
    query: getPartsQuery({
      name,
      database: clickhouseSystemDatabase,
      dateField: metadata?.dateField,
      splitNumDays: splitNumDays,
    }),
    cluster,
    recreateOn: hashColumns(columns),
    dependsOn: [table],
  });

  createClickhouseView({
    name,
    database: clickhousePublicDatabase,
    query,
    cluster,
    recreateOn: hashColumns(columns),
    dependsOn: [table],
  });
}
