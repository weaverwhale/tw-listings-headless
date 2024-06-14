import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider, createK8sService } from '../k8s';
import { getDevopsImage } from '../cloud-build';

export function createFlinkDeployment(args: { name: string; provider: K8sProvider }) {
  const { name, provider } = args;

  const deployment = new kubernetes.apiextensions.CustomResource(
    `${name}-${provider.uuid}`,
    {
      apiVersion: 'flink.apache.org/v1beta1',
      kind: 'FlinkDeployment',
      metadata: {
        name,
      },
      spec: {
        image: getDevopsImage('flink'),
        flinkVersion: 'v1_17',
        flinkConfiguration: {
          'taskmanager.numberOfTaskSlots': '2',
        },
        serviceAccount: 'flink',
        jobManager: {
          resource: {
            memory: '2048m',
            cpu: 1,
          },
        },
        taskManager: {
          resource: {
            memory: '2048m',
            cpu: 1,
          },
        },
      },
    },
    { provider }
  );
  // give the flink service account permissions to read all objects in the cluster
  new kubernetes.rbac.v1.ClusterRoleBinding(
    `${name}-${provider.uuid}`,
    {
      metadata: {
        name: 'flink-cluster-role-binding',
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'cluster-admin',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'flink',
          namespace: 'flink-operator',
        },
      ],
    },
    { provider }
  );
  const { k8sService } = createK8sService({
    name,
    selector: { app: name, component: 'jobmanager' },
    type: 'LoadBalancer',
    ingressMode: 'internal',
    provider,
    ports: [
      {
        name: 'ui',
        port: 8081,
        targetPort: 8081,
      },
      {
        name: 'sql-gateway',
        port: 8083,
        targetPort: 8083,
      },
    ],
  });

  return { deployment };
}
