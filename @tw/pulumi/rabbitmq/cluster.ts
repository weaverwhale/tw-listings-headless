import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider, K8sResources, createK8sIngress, createK8sService } from '../k8s';
import { k8sUniqueName } from '../k8s/utils';
import { TWDomain } from '../utils';
import { projectIdAsSubDomain } from '@tw/constants';
import { createPassword } from '../security';
import { storeHostedServiceInfo } from '../utils/hostedService';

export function createRabbitMQCluster(
  args: { name: string; provider: K8sProvider } & K8sResources
) {
  const {
    name,
    provider,
    CPURequest = 4,
    memoryRequest = '6Gi',
    CPULimit = 8,
    memoryLimit = '32Gi',
  } = args;

  const username = 'admin';
  const password = createPassword({ name: `${name}-rabbitmq`, special: false }).result;

  const deployment = new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    {
      apiVersion: 'rabbitmq.com/v1beta1',
      kind: 'RabbitmqCluster',
      metadata: {
        name: name,
      },
      spec: {
        rabbitmq: {
          additionalConfig: pulumi.interpolate`
          default_user=${username}
          default_pass=${password}
          `,
        },
        replicas: 3,
        persistence: {
          storage: '500Gi',
        },
        resources: {
          requests: {
            cpu: String(CPURequest),
            memory: memoryRequest,
          },
          limits: {
            cpu: String(CPULimit),
            memory: memoryLimit,
          },
        },
      },
    },
    { provider }
  );

  const domain = new TWDomain('triplestack.io', `${name}.rabbitmq`, 'internal');

  const iapDomain = new TWDomain('triplestack.io', `${name}.rabbitmq`, 'iap', projectIdAsSubDomain);

  storeHostedServiceInfo({
    name,
    type: 'rabbitmq',
    data: { username, password, domain: domain.fqdn, iapDomain: iapDomain.fqdn },
  });

  createK8sService({
    name: `${name}-lb`,
    twDomain: domain,
    selector: {
      'app.kubernetes.io/name': name,
    },
    type: 'LoadBalancer',
    ingressMode: 'internal',
    provider,
    ports: [
      {
        name: 'amqp',
        port: 5672,
        targetPort: 5672,
      },
      {
        name: 'http',
        port: 15672,
        targetPort: 15672,
      },
    ],
  });

  createK8sIngress({
    name: name,
    twDomain: iapDomain,
    selector: {
      'app.kubernetes.io/name': name,
    },
    ingressMode: 'iap',
    provider,
    port: 80,
    healthCheckPath: '/',
    targetPort: 15672,
  });
  return { deployment, domain, iapDomain };
}
