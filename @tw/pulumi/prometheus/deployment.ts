import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider, createK8sService } from '../k8s';
import { k8sUniqueName } from '../k8s/utils';
import { TWDomain } from '../utils';
import { createGrafanaDataSource } from '../grafana/dataSource';

export function createPrometheusDeployment(args: { name: string; provider: K8sProvider }) {
  const { name, provider } = args;

  const sa = new kubernetes.core.v1.ServiceAccount(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name: `${name}-prometheus`,
      },
    },
    { provider }
  );

  new kubernetes.rbac.v1.ClusterRoleBinding(
    k8sUniqueName(name, provider),
    {
      metadata: {
        name: `${name}-prometheus`,
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'prometheus',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: sa.metadata.name,
          namespace: provider.namespace,
        },
      ],
    },
    { provider }
  );

  const labelSelector = {
    matchLabels: {
      release: name,
    },
  };

  const namespaceSelector = {};

  const prometheus = new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    // https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.Prometheus
    {
      apiVersion: 'monitoring.coreos.com/v1',
      metadata: {
        name,
      },
      kind: 'Prometheus',
      spec: {
        enableAdminAPI: false,
        evaluationInterval: '30s',
        externalUrl: `http://prometheus-operated.${provider.namespace}:9090`,
        hostNetwork: false,
        image: 'quay.io/prometheus/prometheus:v2.50.1',
        listenLocal: false,
        logFormat: 'logfmt',
        logLevel: 'info',
        paused: false,
        podMonitorNamespaceSelector: namespaceSelector,
        podMonitorSelector: labelSelector,
        probeNamespaceSelector: namespaceSelector,
        probeSelector: labelSelector,
        ruleNamespaceSelector: namespaceSelector,
        ruleSelector: labelSelector,
        scrapeConfigNamespaceSelector: namespaceSelector,
        scrapeConfigSelector: labelSelector,
        serviceMonitorNamespaceSelector: namespaceSelector,
        serviceMonitorSelector: labelSelector,
        portName: 'http-web',
        replicas: 1,
        retention: '10d',
        routePrefix: '/',
        scrapeInterval: '30s',
        storage: {
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '100Gi',
                },
              },
            },
          },
        },
        securityContext: {
          fsGroup: 2000,
          runAsGroup: 2000,
          runAsNonRoot: true,
          runAsUser: 1000,
          seccompProfile: {
            type: 'RuntimeDefault',
          },
        },
        serviceAccountName: sa.metadata.name,
        shards: 1,
        tsdb: {
          outOfOrderTimeWindow: '30s',
        },
        version: 'v2.50.1',
        walCompression: true,
      },
    },
    { provider }
  );

  const twDomain = new TWDomain(
    'triplestack.io',
    `${name}.${provider.cluster_name}.${provider.location}.prometheus`,
    'internal'
  );

  createK8sService({
    name: `${name}-prometheus`,
    provider,
    ingressMode: 'internal',
    type: 'LoadBalancer',
    selector: {
      'app.kubernetes.io/name': 'prometheus',
      'app.kubernetes.io/instance': name,
    },
    ports: [{ port: 9090, targetPort: 9090, name: 'web' }],
    twDomain,
    dependsOn: [prometheus, ...provider.dependsOn],
  });

  createGrafanaDataSource({
    name: `${name}-${provider.cluster_name}-${provider.location}`,
    url: `http://${twDomain.fqdn}:9090`,
    type: 'prometheus',
    jsonData: {
      httpMethod: 'POST',
    },
  });
}
