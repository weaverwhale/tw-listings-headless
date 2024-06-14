import { K8sProvider, createK8sService } from '../k8s';
import * as kubernetes from '@pulumi/kubernetes';
import { k8sUniqueName } from '../k8s/utils';
import { toYamlOutput } from '../pulumi-utils';
import { createPrometheusMonitor } from '../prometheus';
import { TWDomain } from '../utils';

// https://opentelemetry.io/docs/kubernetes/collector/components/

export function createOtelCollector(args: {
  name: string;
  provider: K8sProvider;
  mode: 'daemonset' | 'deployment';
  createLb?: boolean;
  debug?: boolean;
}) {
  const { name, provider, mode, createLb, debug } = args;
  const nodeSelector = {};
  const tolerations = [];

  if (mode === 'daemonset') {
    nodeSelector['triplewhale.com/otel'] = 'true';

    tolerations.push(
      {
        effect: 'NoExecute',
        operator: 'Exists',
      },
      {
        effect: 'NoSchedule',
        operator: 'Exists',
      }
    );
  }

  const opts = {
    // https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md
    apiVersion: 'opentelemetry.io/v1alpha1',
    kind: 'OpenTelemetryCollector',
    metadata: {
      name,
    },
    spec: {
      image: 'otel/opentelemetry-collector',
      // https://opentelemetry.io/docs/collector/configuration/
      config: toYamlOutput({
        receivers: {
          otlp: {
            protocols: {
              grpc: {
                endpoint: '0.0.0.0:4317',
              },
              http: {
                endpoint: '0.0.0.0:4318',
              },
            },
          },
        },
        exporters: {
          debug: {
            verbosity: 'detailed',
          },
          prometheus: {
            endpoint: '0.0.0.0:9090',
            namespace: provider.namespace,
          },
          'otlp/jaeger': {
            endpoint: 'saber-jaeger-collector.observability.svc.cluster.local:4317',
            tls: {
              insecure: true,
            },
          },
          'otlp/signoz': {
            endpoint: 'signoz-otel-collector.signoz.svc.cluster.local:4317',
            tls: {
              insecure: true,
            },
          },
        },
        service: {
          ...(debug
            ? {
                telemetry: {
                  logs: {
                    level: 'debug',
                  },
                },
              }
            : {}),
          pipelines: {
            metrics: {
              receivers: ['otlp'],
              exporters: ['prometheus', 'otlp/signoz', ...(debug ? ['debug'] : [])],
            },
            traces: {
              receivers: ['otlp'],
              exporters: ['otlp/jaeger', 'otlp/signoz', ...(debug ? ['debug'] : [])],
            },
          },
        },
      }),
      ports: [
        {
          name: 'prometheus',
          port: 9090,
          protocol: 'TCP',
        },
      ],
      mode,
      nodeSelector,
      tolerations,
      hostNetwork: mode === 'daemonset',
      resources: {
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
        limits: {
          cpu: '500m',
          memory: '1Gi',
        },
      },
    },
  };

  const collector = new kubernetes.apiextensions.CustomResource(
    k8sUniqueName(name, provider),
    opts,
    { provider }
  );

  const labels = {
    'app.kubernetes.io/component': 'opentelemetry-collector',
    'app.kubernetes.io/instance': `${provider.namespace}.${name}`,
    'app.kubernetes.io/managed-by': 'opentelemetry-operator',
    'app.kubernetes.io/name': `${name}-collector`,
    'app.kubernetes.io/part-of': 'opentelemetry',
  };

  createPrometheusMonitor({
    name: 'otel-collector',
    endpoints: [
      {
        portName: 'prometheus',
      },
      {
        portName: 'metrics',
      },
    ],
    release: 'workloads',
    kind: 'Pod',
    labels,
    provider,
  });

  if (createLb) {
    createK8sService({
      name: `${name}-collector-lb`,
      twDomain: new TWDomain(
        'triplestack.io',
        `${name}.${provider.cluster_name}.${provider.location}.otel`,
        'internal'
      ),
      selector: labels,
      type: 'LoadBalancer',
      ingressMode: 'internal',
      provider,
      ports: [
        {
          name: 'prometheus',
          port: 9090,
          targetPort: 9090,
        },
        {
          name: 'otlp-http',
          port: 4318,
          targetPort: 4318,
        },
        {
          name: 'otlp-grpc',
          port: 4317,
          targetPort: 4317,
        },
      ],
      dependsOn: [collector, ...provider.dependsOn],
    });
  }

  return collector;
}
