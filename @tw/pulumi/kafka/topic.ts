import * as kafka from '@pulumi/kafka';
import { getKafkaProvider } from './provider';

export function createKafkaTopic(args: {
  name: string;
  provider?: kafka.Provider;
  partitions?: number;
  replicationFactor?: number;
}) {
  const { name, provider = getKafkaProvider(), partitions = 20, replicationFactor = 1 } = args;
  const topic = new kafka.Topic(
    name,
    {
      name,
      partitions,
      replicationFactor,
      config: {
        'retention.ms': '604800000',
        'max.message.bytes': 15 * 1024 * 1024,
      },
    },
    { provider, deleteBeforeReplace: true }
  );
  return { topic };
}
