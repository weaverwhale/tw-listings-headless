import * as rabbitmq from '@pulumi/rabbitmq';
import * as pulumi from '@pulumi/pulumi';
import { getSecretValue } from '../secrets';

const rabbitMQProviders = {};

export function getRabbitMQProvider(name: string = 'sonic-cluster') {
  if (!rabbitMQProviders[name]) {
    const secret = getSecretValue(`${name}-rabbitmq`).apply(JSON.parse);
    rabbitMQProviders[name] = new rabbitmq.Provider(name, {
      endpoint: secret.apply((s) => 'http://' + s.domain + ':15672'),
      password: pulumi.secret(secret.apply((s) => s.password)),
      username: secret.apply((s) => s.username),
    });
  }
  return rabbitMQProviders[name];
}
