import * as kafka from '@pulumi/kafka';
import { getSecretValue } from '../secrets';

const kafkaProviders = {};

export function getKafkaProvider(name: string = 'sonic-cluster') {
  if (!kafkaProviders[name]) {
    const secret = getSecretValue(`${name}-kafka`).apply(JSON.parse);
    const domain = secret.apply((s) => s.bootstrapDomain + ':9092');
    kafkaProviders[name] = new kafka.Provider(name, {
      bootstrapServers: [domain],
      tlsEnabled: false,
    });
  }
  return kafkaProviders[name];
}
