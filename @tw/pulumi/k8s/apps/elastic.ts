import { K8sProvider } from '../provider';
import * as kubernetes from '@pulumi/kubernetes';
import { k8sUniqueName } from '../utils';
import { createPassword } from '../../security';

export function createElasticCluster(args: { name: string; provider: K8sProvider }) {
  const { name, provider } = args;

  const password = createPassword({ name: `${name}-es`, special: false }).result;

  const userpassSecret = new kubernetes.core.v1.Secret(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name: name,
      },
      type: 'kubernetes.io/basic-auth',
      stringData: {
        username: 'admin',
        password,
        // https://www.elastic.co/guide/en/elasticsearch/reference/current/built-in-roles.html
        roles: 'superuser,kibana_admin,ingest_admin,monitor,viewer',
      },
    },
    { provider }
  );

  const esCluster = new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    {
      apiVersion: 'elasticsearch.k8s.elastic.co/v1',
      kind: 'Elasticsearch',
      metadata: {
        name,
      },
      spec: {
        version: '8.13.0',
        auth: {
          fileRealm: [
            {
              secretName: userpassSecret.metadata.name,
            },
          ],
        },
        nodeSets: [
          {
            name: 'default',
            config: {
              'node.roles': ['master', 'data'],
              'node.attr.attr_name': 'attr_value',
              'node.store.allow_mmap': false,
            },
            volumeClaimTemplates: [
              {
                metadata: {
                  name: 'elasticsearch-data',
                },
                spec: {
                  accessModes: ['ReadWriteOnce'],
                  resources: {
                    requests: {
                      storage: '1000Gi',
                    },
                  },
                  storageClassName: 'standard',
                },
              },
            ],
            podTemplate: {
              metadata: {
                labels: {
                  foo: 'bar',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'elasticsearch',
                    resources: {
                      requests: {
                        memory: '64Gi',
                        cpu: '8',
                      },
                      limits: {
                        memory: '64Gi',
                        cpu: '16',
                      },
                    },
                  },
                ],
              },
            },
            count: 3,
          },
        ],
      },
    },
    { provider }
  );
  return { password, esCluster };
}
