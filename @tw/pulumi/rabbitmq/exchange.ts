import * as rabbitmq from '@pulumi/rabbitmq';
import { getRabbitMQProvider } from './provider';

type ExchangeType = 'fanout' | 'direct' | 'topic' | 'headers';

export function createRabbitMQExchange(args: {
  name: string;
  type?: ExchangeType;
  provider?: rabbitmq.Provider;
}) {
  const { name, provider = getRabbitMQProvider(), type = 'topic' } = args;
  const exchange = new rabbitmq.Exchange(
    name,
    {
      name,
      settings: {
        durable: true,
        autoDelete: false,
        type,
      },
    },
    { provider }
  );
  return exchange;
}
