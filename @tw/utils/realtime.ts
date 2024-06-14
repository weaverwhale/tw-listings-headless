import { Emitter } from '@socket.io/redis-emitter';
import { RealtimeEvent } from '@tw/types';
import { redisClients } from './redisClient';
import { callPubSub } from './callPubSub';
import { logger } from './logger';

let socketIo;

function createEmitter() {
  const client = redisClients['realtime'];
  if (!client) {
    return logger.warn('No redis client for realtime');
  }
  socketIo = new Emitter(client);
}

export function sendMessageToClient<D = any>(event: RealtimeEvent<D>) {
  let channel = event.scope;
  if (event.account) {
    channel += `:${event.account}`;
  }
  if (!socketIo) {
    createEmitter();
  }
  socketIo.to(channel).emit('message', event);
}

export function sendMessageToClientPubsub<D = any>(event: RealtimeEvent<D>) {
  return callPubSub('send-realtime-message', event);
}
