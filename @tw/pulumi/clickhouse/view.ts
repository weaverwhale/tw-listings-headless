import * as pulumi from '@pulumi/pulumi';
import { Input } from '@pulumi/pulumi';
import { View, Table } from '@tw/pulumi-clickhouse';
import { getClickhouseProvider } from './provider';
import { DependsOn } from '../pulumi-utils';

export function createClickhouseView(tableArgs: {
  name: string;
  database: Input<string>;
  cluster?: Input<string>;
  query: Input<string>;
  materialized?: boolean;
  toTable?: Table;
  comment?: Input<string>;
  dependsOn?: DependsOn;
  recreateOn?: string;
}) {
  const {
    cluster = 'main',
    database,
    name,
    materialized = false,
    query,
    toTable,
    dependsOn,
    recreateOn,
  } = tableArgs;
  let { comment } = tableArgs;

  if (recreateOn) {
    comment = comment ? `${recreateOn}. ${comment}` : recreateOn;
  }
  const tableName = name.replace(/-/g, '_');

  const table = new View(
    `${database}.${tableName}`,
    {
      cluster,
      database,
      name: tableName,
      materialized,
      query,
      toTable: toTable ? pulumi.interpolate`${toTable.database}.${toTable.name}` : undefined,
      comment,
    },
    {
      deleteBeforeReplace: true,
      provider: getClickhouseProvider(),
      dependsOn,
      aliases: [{ name: `${database}.${name.replace(/_/g, '-')}` }],
    }
  );
  return table;
}
