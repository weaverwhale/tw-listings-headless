import { createClient, RedisClientOptions } from 'redis';
import { isLocal, localHost } from '@tw/constants';
import { logger } from './logger';

export type RedisClient = ReturnType<typeof createClient>;

export let redisClients: Record<string, RedisClient> = {};
const logged = {};

/**
 * Returns a Redis client instance.
 * @param host - The host of the Redis server.
 * @param additionalOptions - Additional options for the Redis client.
 * @param additionalOptions.singleClient - If true, returns a single Redis client instance for the specified name.
 * @param additionalOptions.name - The name of the Redis client instance.
 * @returns The Redis client instance.
 */
export function getRedisClient(
  host,
  additionalOptions: { singleClient?: boolean; name?: string; forceCloud?: boolean } = {}
): RedisClient {
  const { singleClient, name = 'default' } = additionalOptions;
  const forceCloud = additionalOptions.forceCloud || process.env.FORCE_CLOUD === 'true';
  if (singleClient && redisClients[name]) return redisClients[name];
  const options: RedisClientOptions = {
    url: `redis://${isLocal && !forceCloud ? localHost : host}:6379`,
  };

  const client = createClient(options);
  client.on('error', (err) => {
    if (isLocal) {
      if (logged[name]) return;
      logged[name] = true;
    }
    logger.error(`Redis error <${options.url}>:`, err);
  });
  client.on('ready', () => {
    logger.info(`Redis ready <${options.url}>`);
  });
  client.on('reconnecting', () => {
    if (isLocal) {
      if (logged[name]) return;
      logged[name] = true;
    }
    logger.info(`Redis reconnecting <${options.url}>`);
  });
  if (singleClient) {
    redisClients[name] = client;
    redisClients[name].connect();
  }
  return client;
}
