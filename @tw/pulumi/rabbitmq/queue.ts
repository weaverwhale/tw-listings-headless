import * as rabbitmq from '@pulumi/rabbitmq';
import { getRabbitMQProvider } from './provider';

export function createRabbitMQQueue(args: {
  name: string;
  provider?: rabbitmq.Provider;
  queueType?: 'quorum' | 'stream';
}) {
  const { name, provider = getRabbitMQProvider(), queueType = 'stream' } = args;
  const queue = new rabbitmq.Queue(
    name,
    {
      name,
      settings: {
        durable: true,
        autoDelete: false,
        arguments: {
          'x-queue-type': queueType,
        },
      },
    },
    { provider }
  );
  return queue;
}
