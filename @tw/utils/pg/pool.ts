import { ConnectionConfig, Pool, PoolConfig } from 'pg';
import { serviceId } from '@tw/constants';
import { logger } from '../logger';

export const pools: Record<string, Pool> = {};

export function getPGPool(args: { name?: string; config: PoolConfig }): Pool {
  const { config, name } = args;
  const conf = getPGConnectionConfig(config);
  const databaseKey = conf.database ? `:${conf.database}` : '';
  const key = `${conf.host}:${conf.port}${databaseKey}:${conf.statement_timeout || 0}`;
  if (pools[key]) return pools[key];
  const pool = new Pool({
    idleTimeoutMillis: 30000,
    max: 100,
    ...conf,
  });
  // @ts-ignore
  pool.name = name || conf.host;
  pool.on('error', (err) => {
    logger.error('PG: Unexpected error on idle client', err);
  });
  pools[key] = pool;
  return pool;
}

export function getPGConnectionConfig(config: PoolConfig): ConnectionConfig {
  return {
    port: 5432,
    connectionTimeoutMillis: 1000,
    application_name: `tw-${serviceId}`,
    keepAlive: true,
    ...config,
  };
}
