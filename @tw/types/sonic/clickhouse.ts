export type ClickhouseColumnTypes =
  | ClickhouseColumnBaseTypes
  | `LowCardinality(${ClickhouseColumnBaseTypes})`
  | `DateTime64(${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9})`
  | `Tuple(${string})`;

type ClickhouseColumnBaseTypes =
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'UInt128'
  | 'UInt256'
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Int64'
  | 'Int128'
  | 'Int256'
  | 'Float32'
  | 'Float64'
  | 'Bool'
  | 'String'
  | 'UUID'
  | 'Date'
  | 'Date32'
  | 'DateTime';

export interface ClickhouseTableColumn {
  comment?: string;
  name: string;
  type: string;
}

export interface ClickhouseTableIndex {
  expression: string;
  granularity?: number;
  name: string;
  type: string;
}

export interface ClickHouseTableColumn {
  comment?: string;
  defaultExpression?: string;
  defaultKind?: string;
  name: string;
  type: string;
}

export type ClickhouseBaseColumn = Omit<ClickHouseTableColumn, 'defaultKind'> & {
  nullable?: boolean;
  array?: boolean;
  pii?: boolean;
  sii?: boolean;
  defaultKind?: 'DEFAULT' | 'MATERIALIZED' | 'EPHEMERAL' | 'ALIAS';
};

export type ClickhouseStandardColumn = Omit<ClickhouseBaseColumn, 'type'> & {
  type: ClickhouseColumnTypes;
};

export type ClickhouseNestedColumn = Omit<ClickhouseBaseColumn, 'type'> & {
  type: 'Nested';
  columns: ClickhouseColumn[];
};

export type ClickhouseColumn = ClickhouseStandardColumn | ClickhouseNestedColumn;

export type ClickhouseColumnUnnested = Omit<ClickhouseColumn, 'type'> & {
  type: string;
};

export type indexTypes = 'minmax' | 'set' | 'bloom_filter' | 'tokenbf_v1' | 'ngrambf_v1';

export type ClickhouseIndex = Omit<ClickhouseTableIndex, 'type'> & {
  type: indexTypes;
};

export type ClickhouseTableEngines =
  | 'MergeTree'
  | 'ReplicatedMergeTree'
  | 'Distributed'
  | 'ReplacingMergeTree'
  | 'Kafka'
  | 'ReplicatedReplacingMergeTree'
  | 'Null';
