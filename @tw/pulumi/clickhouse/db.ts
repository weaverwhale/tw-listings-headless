import { Db } from '@tw/pulumi-clickhouse';

import type { DbArgs } from '@tw/pulumi-clickhouse';
import { getClickhouseProvider } from './provider';

export function createDb(dbArgs: DbArgs): Db {
  if (!dbArgs.cluster) {
    dbArgs.cluster = 'main';
  }
  return new Db(dbArgs.name as string, dbArgs, {
    provider: getClickhouseProvider(),
  });
}
