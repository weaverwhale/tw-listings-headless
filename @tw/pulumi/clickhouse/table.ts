import { Input } from '@pulumi/pulumi';
import { Table, types } from '@tw/pulumi-clickhouse';
import { getClickhouseProvider } from './provider';
import { getKafkaProvider } from '../kafka';
import { getPartitionBies, useCluster } from './utils';
import {
  ClickhouseTableEngines,
  ClickhouseIndex,
  ClickhouseColumn,
  ClickhouseColumnUnnested,
} from '@tw/types';

export type ClickhouseTableArgs = {
  name: string;
  database: Input<string>;
  cluster?: Input<string>;
  engine: ClickhouseTableEngines;
  engineParams?: Input<Input<string>[]>;
  orderBies?: string[];
  metadata?: {
    dateField: string;
    providerIdField: Input<string>;
    providerAccountField: Input<string>;
  };
  indices?: Input<Input<ClickhouseIndex>[]>;
  partitionBies?: types.input.TablePartitionBy[];
  columns?: ClickhouseColumn[];
  settings?: { [key: string]: any };
  comment?: Input<string>;
  protect?: boolean;
};

export type KafkaArgs = {
  name: string;
  topic?: string;
  columns: ClickhouseColumn[];
  consumerGroup?: string;
  kafkaFormat?: string;
  kafkaThreadPerConsumer?: number;
  kafkaNumConsumers?: number;
};

function wrapType(baseType: string, nullable: boolean, array: boolean): string {
  let resultType = baseType;
  if (nullable) {
    resultType = `Nullable(${resultType})`;
  }
  if (array) {
    resultType = `Array(${resultType})`;
  }
  return resultType;
}

function unnestColumn(column: ClickhouseColumn): string {
  const name = column.name.includes('.') ? `\`${column.name}\`` : column.name;
  if (column.type !== 'Nested') {
    return `${name} ${wrapType(column.type, column.nullable, column.array)}`;
  }
  return `${name} Nested(${column['columns'].map(unnestColumn).join(', ')})`;
}

function convertColumn(column: ClickhouseColumn): ClickhouseColumnUnnested {
  let commentString: string;
  if (column.comment || column.pii || column.sii) {
    let comment: any = {};
    if (column.comment) {
      comment.comment = column.comment;
    }
    if (column.pii) {
      comment.pii = column.pii;
    }
    if (column.sii) {
      comment.sii = column.sii;
    }
    commentString = JSON.stringify(comment).replace(/'/g, "\\'");
  }

  if (column.type !== 'Nested') {
    return {
      name: column.name,
      type: wrapType(column.type, column.nullable, column.array),
      defaultExpression: column.defaultExpression,
      defaultKind: column.defaultKind,
      comment: commentString,
    };
  }
  return {
    name: column.name,
    type: `Nested(${column['columns'].map(unnestColumn).join(', ')})`,
    defaultExpression: column.defaultExpression,
    defaultKind: column.defaultKind,
    comment: commentString,
  };
}

function columnsForKafka(columns: ClickhouseColumn[]) {
  return columns.map((column) => {
    const { defaultExpression, defaultKind, ...rest } = column;
    return rest;
  });
}

export function createKafkaTable(args: KafkaArgs & { database: string }) {
  const {
    name,
    database,
    topic,
    consumerGroup = topic,
    kafkaFormat: kafka_format = 'JSONEachRow',
    columns,
    kafkaThreadPerConsumer = 0,
    kafkaNumConsumers = 4,
  } = args;

  const kafkaProvider = getKafkaProvider();

  return createClickhouseTable({
    database,
    engine: 'Kafka',
    settings: {
      kafka_broker_list: kafkaProvider.bootstrapServers.apply((s: any) => JSON.parse(s)[0]),
      kafka_topic_list: topic,
      kafka_group_name: consumerGroup,
      kafka_format,
      kafka_thread_per_consumer: String(kafkaThreadPerConsumer),
      kafka_num_consumers: String(kafkaNumConsumers),
      // kafka_handle_error_mode: 'stream',
      kafka_commit_every_batch: '1',
      kafka_handle_error_mode: 'stream',
    },
    metadata: null,
    name,
    columns: columnsForKafka(columns),
  });
}

function defaultSettings(engine: ClickhouseTableEngines) {
  if (
    engine === 'ReplicatedMergeTree' ||
    engine === 'ReplicatedReplacingMergeTree' ||
    engine === 'ReplacingMergeTree'
  ) {
    return {
      number_of_free_entries_in_pool_to_execute_mutation: '60', // slightly lower than server-level background_pool_size. https://kb.altinity.com/altinity-kb-setup-and-maintenance/altinity-kb-aggressive_merges/
    };
  }
  return {};
}

export function createClickhouseTable(tableArgs: ClickhouseTableArgs) {
  const {
    engine,
    cluster = useCluster(engine),
    database,
    name,
    columns,
    indices,
    orderBies,
    engineParams = [],
    comment,
    metadata,
    protect,
  } = tableArgs;

  const tableName = name.replace(/-/g, '_');

  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error('Table name must contain only characters, numbers and underscores');
  }

  var { settings, partitionBies } = tableArgs;

  if (!partitionBies?.length && metadata) {
    partitionBies = getPartitionBies({ metadata, columns });
  }

  settings = {
    ...defaultSettings(engine),
    ...settings,
  };

  const unnestedColumns = columns.map((column) => convertColumn(column)).flat();
  const table = new Table(
    `${database}.${tableName}`,
    {
      cluster,
      database,
      name: tableName,
      columns: unnestedColumns,
      engine,
      engineParams,
      indices,
      orderBies,
      partitionBies,
      comment,
      settings,
    },
    {
      replaceOnChanges: engine === 'Kafka' || engine === 'Null' ? ['columns'] : undefined,
      protect,
      deleteBeforeReplace: true,
      provider: getClickhouseProvider(),
      aliases: [{ name: `${database}.${name.replace(/_/g, '-')}` }],
    }
  );
  return table;
}
