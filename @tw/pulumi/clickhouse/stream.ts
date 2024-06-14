import * as pulumi from '@pulumi/pulumi';
import { ClickhouseColumn } from '@tw/types';
import { createHash } from 'crypto';
import { ScheduleOverlapPolicy } from '@temporalio/client';
import { createKafkaConnectorClickhouse, createKafkaTopic } from '../kafka';
import { ClickhousePipelineArgs } from './pipeline';
import { createClickhouseTable, createKafkaTable } from './table';
import { clickhouseSystemDatabase, sonicUpdatedAtColumn } from './utils';
import { createClickhouseView } from './view';
import { Table } from '@tw/pulumi-clickhouse';
import { createTemporalSchedule } from '../temporal';
import { getConfigs } from '../utils';
import { getK8sProvider } from '../k8s';

const kafkaErrorColumns: ClickhouseColumn[] = [
  { name: '_topic', type: 'LowCardinality(String)' },
  { name: '_key', type: 'String' },
  { name: '_offset', type: 'UInt64' },
  { name: '_timestamp', type: 'DateTime', nullable: true },
  { name: '_timestamp_ms', type: 'DateTime', nullable: true },
  { name: '_partition', type: 'UInt64' },
  {
    name: '_headers',
    type: 'Nested',
    columns: [
      { name: 'name', type: 'String' },
      { name: 'value', type: 'String' },
    ],
  },
  { name: '_raw_message', type: 'String' },
  { name: '_error', type: 'String' },
];

export function createStream(args: {
  name: string;
  tableArgs: ClickhousePipelineArgs['tableArgs'];
  pipelineArgs: ClickhousePipelineArgs['pipelineArgs'];
  table: Table;
  mode: 'STREAM' | 'STREAM_SPLIT';
}) {
  const { mode, tableArgs, pipelineArgs, table } = args;

  const { metadata, columns, engineParams, orderBies, partitionBies, settings } = tableArgs;

  const {
    topic,
    consumerGroup,
    kafkaFormat,
    kafkaThreadPerConsumer,
    kafkaNumConsumers,
    streamEngine,
    splitNumDays,
    interval = '5 minutes',
  } = pipelineArgs || {};

  const { projectId } = getConfigs();

  const tableName = args.name.replace(/-/g, '_');
  const name = args.name.replace(/_/g, '-');

  createKafkaTopic({ name });

  // TODO mode is top level, streamEngine is inner level
  let oldTable;
  if (mode === 'STREAM_SPLIT') {
    oldTable = createClickhouseTable({
      name: `${tableName}__old`,
      database: clickhouseSystemDatabase,
      engine: 'MergeTree',
      metadata,
      // 15 minute chunks
      partitionBies: [
        { by: sonicUpdatedAtColumn, partitionFunction: 'toYYYYMMDD' },
        { by: sonicUpdatedAtColumn, partitionFunction: 'toHour' },
        { by: `intDiv(toMinute(${sonicUpdatedAtColumn}), 15)` },
      ],
      orderBies: (partitionBies.length ? partitionBies.map((p) => p.by) : orderBies) as string[],
      columns,
      settings,
    });
    createClickhouseTable({
      name: `${tableName}__temp`,
      database: clickhouseSystemDatabase,
      engine: 'ReplacingMergeTree',
      engineParams,
      orderBies,
      partitionBies,
      metadata,
      columns,
      settings,
    });
  }

  if (streamEngine === 'clickhouse-table') {
    createStreamKafkaEngine({
      tableName,
      topic,
      consumerGroup,
      columns,
      kafkaFormat,
      kafkaThreadPerConsumer,
      kafkaNumConsumers,
      mode,
      splitNumDays,
      metadata,
      table,
      oldTable,
    });
  }

  if (streamEngine === 'kafka-connect') {
    const defaultTable = mode === 'STREAM_SPLIT' ? oldTable.name : table.name;
    createKafkaConnectorClickhouse({
      name: name,
      provider: getK8sProvider({ cluster: 'sonic-cluster', namespace: 'kafka-connect' }),
      topics: [pipelineArgs.topic],
      defaultTable,
      realtimeTable: table.name,
      dateField: metadata?.dateField || 'event_date',
      splitDays: splitNumDays,
    });
  }

  if (mode === 'STREAM_SPLIT') {
    createTemporalSchedule(name, {
      projectId,
      serviceId: 'clickhouse-ops',
      namespace: 'clickhouse-ops-ns',
      scheduleId: name,
      spec: {
        intervals: [{ every: interval }],
      },
      action: {
        type: 'startWorkflow',
        workflowType: 'mergePartition',
        taskQueue: 'queue',
        args: [
          {
            table: table.name,
            partitioning: partitionBies[0],
            splitNumDays,
          },
        ],
        searchAttributes: {
          merge_table: [tableName], // 'table' is reserved
        },
      },
      policies: { overlap: ScheduleOverlapPolicy.BUFFER_ONE },
    });

    if (metadata.dateField) {
      // once a day, run optimize on the day that just dropped off the end of the dedup window
      // run at a random hour between 1 and 22
      createTemporalSchedule(`${name}-optimize`, {
        projectId,
        serviceId: 'clickhouse-ops',
        namespace: 'clickhouse-ops-ns',
        scheduleId: `${name}-optimize`,
        spec: {
          calendars: [{ second: 0, ...getScheduleOffset(name) }],
        },
        action: {
          type: 'startWorkflow',
          workflowType: 'optimize',
          taskQueue: 'queue',
          args: [
            { database: clickhouseSystemDatabase, table: tableName, daysBack: splitNumDays + 1 },
          ],
        },
        policies: { overlap: ScheduleOverlapPolicy.BUFFER_ONE },
      });
    }
  }
}

function getScheduleOffset(tableName: string) {
  const hash = createHash('sha256').update(tableName).digest('hex');
  const hour = (parseInt(hash.slice(0, 8), 16) % 22) + 1;
  const minute = parseInt(hash.slice(8, 16), 16) % 60;
  return { hour, minute };
}

function createStreamKafkaEngine(args: {
  tableName: string;
  topic: string;
  consumerGroup: string;
  columns: ClickhouseColumn[];
  kafkaFormat: string;
  kafkaThreadPerConsumer: number;
  kafkaNumConsumers: number;
  mode: string;
  splitNumDays: number;
  metadata: {
    dateField: string;
  };
  table: Table;
  oldTable: Table;
}) {
  const {
    tableName,
    topic,
    consumerGroup,
    columns,
    kafkaFormat,
    kafkaThreadPerConsumer,
    kafkaNumConsumers,
    mode,
    splitNumDays,
    metadata,
    table,
    oldTable,
  } = args;

  const queueTable = createKafkaTable({
    name: `${tableName}__queue`,
    database: clickhouseSystemDatabase,
    topic,
    consumerGroup,
    columns,
    kafkaFormat,
    kafkaThreadPerConsumer,
    kafkaNumConsumers,
  });

  // https://kb.altinity.com/altinity-kb-integrations/altinity-kb-kafka/error-handling/#after-216
  const nullTable = createClickhouseTable({
    name: `${tableName}__null`,
    database: clickhouseSystemDatabase,
    engine: 'Null',
    columns: [...columns, ...kafkaErrorColumns],
    metadata: null,
  });

  const errorsTable = createClickhouseTable({
    name: `${tableName}__errors`,
    database: clickhouseSystemDatabase,
    engine: 'ReplicatedMergeTree',
    columns: kafkaErrorColumns.map((col) => {
      return { ...col, name: col.name.substring(1) };
    }),
    orderBies: ['timestamp'],
    settings: {
      allow_nullable_key: true,
    },
    metadata: null,
  });

  createClickhouseView({
    name: `${tableName}__mv`,
    cluster: '',
    database: clickhouseSystemDatabase,
    materialized: true,
    query: pulumi.interpolate`SELECT *, _topic, _key, _offset, _timestamp, _timestamp_ms, _partition, _headers, _raw_message, _error, now() AS ${sonicUpdatedAtColumn} FROM ${clickhouseSystemDatabase}.${queueTable.name}`,
    toTable: nullTable,
  });

  createClickhouseView({
    name: `${tableName}__errors_mv`,
    cluster: '',
    database: clickhouseSystemDatabase,
    materialized: true,
    query: pulumi.interpolate`SELECT _topic AS topic, _key as key, _offset as offset, _timestamp as timestamp,
        _timestamp_ms as timestamp_ms, _partition AS partition, _headers as headers,
        _raw_message AS raw_message, _error AS error
        FROM ${clickhouseSystemDatabase}.${nullTable.name}
        WHERE length(_error) > 0`,
    toTable: errorsTable,
  });

  if (mode === 'STREAM') {
    createClickhouseView({
      name: `${tableName}__all_mv`,
      cluster: '',
      database: clickhouseSystemDatabase,
      materialized: true,
      query: pulumi.interpolate`SELECT *, now() AS ${sonicUpdatedAtColumn} FROM ${clickhouseSystemDatabase}.${nullTable.name} WHERE length(_error) = 0`,
      toTable: table,
    });
  } else if (mode === 'STREAM_SPLIT') {
    if (metadata.dateField) {
      createClickhouseView({
        name: `${tableName}__new_mv`,
        cluster: '',
        database: clickhouseSystemDatabase,
        materialized: true,
        query: pulumi.interpolate`SELECT *, now() AS ${sonicUpdatedAtColumn} FROM ${clickhouseSystemDatabase}.${nullTable.name} WHERE (${metadata.dateField} >= today() - ${splitNumDays}
             and (length(_error) = 0))`,
        toTable: table,
      });
    }

    createClickhouseView({
      name: `${tableName}__old_mv`,
      cluster: '',
      database: clickhouseSystemDatabase,
      materialized: true,
      query: pulumi.interpolate`SELECT *, now() AS ${sonicUpdatedAtColumn} FROM ${clickhouseSystemDatabase}.${
        nullTable.name
      } WHERE (${
        metadata.dateField ? `${metadata.dateField} < today() - ${splitNumDays}` : 'true'
      } and (length(_error) = 0))`,
      toTable: oldTable,
    });
  }
}
