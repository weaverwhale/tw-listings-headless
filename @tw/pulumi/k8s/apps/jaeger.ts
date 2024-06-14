import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from '../provider';
import { K8sResources } from '../types';
import { k8sUniqueName } from '../utils';
import { createK8sIngress } from '../ingress';
import { projectIdAsSubDomain } from '@tw/constants';
import { TWDomain } from '../../utils';
import { dependOnK8sClusterOperators } from '../cluster';

export function createJaegerCluster(
  args: { name: string; provider: K8sProvider; esPassword: any } & K8sResources
) {
  const { name, esPassword } = args;
  const provider = dependOnK8sClusterOperators(args.provider, ['jaeger']);
  new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    {
      apiVersion: 'jaegertracing.io/v1',
      kind: 'Jaeger',
      metadata: {
        name: `${name}-jaeger`,
      },
      // https://www.jaegertracing.io/docs/1.57/operator/
      spec: {
        strategy: 'production',
        collector: {
          maxReplicas: 5,
          resources: {
            requests: {
              cpu: '100m',
              memory: '128Mi',
            },
            limits: {
              cpu: '500m',
              memory: '800Mi',
            },
          },
        },
        storage: {
          type: 'elasticsearch',
          options: {
            es: {
              'server-urls': `https://${name}-es-internal-http:9200`,
              tls: {
                enabled: true,
                key: '/es/certificates/tls.key',
                cert: '/es/certificates/tls.crt',
                'skip-host-verify': true,
              },
              username: 'admin',
              password: esPassword,
            },
          },
        },
        volumeMounts: [
          {
            name: 'certificates',
            mountPath: '/es/certificates/',
            readOnly: true,
          },
        ],
        volumes: [
          {
            name: 'certificates',
            secret: {
              secretName: `${name}-es-http-certs-internal`,
            },
          },
        ],
        ingress: {
          enabled: false,
        },
      },
    },
    { provider }
  );
  createK8sIngress({
    name: name,
    twDomain: new TWDomain('triplestack.io', `${name}.jaeger`, 'iap', projectIdAsSubDomain),
    selector: {
      'app.kubernetes.io/name': 'saber-jaeger-query',
    },
    ingressMode: 'iap',
    provider,
    port: 80,
    healthCheckPath: '/',
    targetPort: 16686,
  });
}
