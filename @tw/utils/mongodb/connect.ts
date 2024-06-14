import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { getSecret } from '../secrets';
import { isLocal } from '@tw/constants';
import { logger } from '../logger';
import { sleep } from '../sleep';

export let connections: { [key: string]: Connection } = {};

export async function connectToMongoDb(args?: {
  autoIndex?: boolean;
  useLocal?: boolean;
  name?: string;
  setAsDefault?: boolean;
  defaultDb?: string;
  connectionOptions?: ConnectOptions;
  connectionString?: string;
}) {
  let connectionRetries = 0;
  let {
    autoIndex,
    useLocal,
    name,
    setAsDefault = true,
    defaultDb = process.env.SERVICE_ID,
    connectionOptions = {},
    connectionString = getSecret('MONGODB_URL'),
  } = args || {};

  if (!name) name = 'default';
  if (connections[name]) {
    logger.warn('mongodb: already connected');
    return connections[name];
  }

  if (isLocal && useLocal) {
    connectionString = `mongodb://localhost:27017/${defaultDb}`;
  }

  if (!connectionString) return;

  const options: mongoose.ConnectOptions = {
    authSource: 'admin',
    family: 4,
    autoIndex: autoIndex ? autoIndex : false,
    retryWrites: true,
    writeConcern: { w: 'majority' },
    ...connectionOptions,
  };

  while (connectionRetries < 10) {
    let connection: Connection;
    try {
      if (!connections[name]) {
        if (setAsDefault) {
          mongoose.connect(connectionString, options);
          connection = mongoose.connection;
        } else {
          connection = mongoose.createConnection(connectionString, options);
        }
        connections[name] = connection;
        await connection.asPromise();
      } else {
        connection = connections[name];
        await connection.getClient()?.connect();
        connection.setClient(connection.getClient());
      }
      logger.info(`MongoDB Connected: ${connection.host}`);
      return connection;
    } catch (e) {
      logger.error('MONGODB connection error: ', e);
      await sleep(1000);
      connectionRetries++;
    }
  }
}

export function getConnection(name = 'default'): Connection {
  return connections[name] || mongoose.connection;
}
