import { K8sProvider, getK8sProvider } from '../provider';
import { deployToK8s } from '../helper';
import { createPrometheusMonitor } from '../../prometheus';

export function createKafkaExporter(args: {
  provider: K8sProvider;
  name: string;
  servers: string[];
}) {
  const { name, servers } = args;
  const provider = getK8sProvider({ provider: args.provider, namespace: 'monitoring' });
  const app = `${name}-kafka-exporter`;
  deployToK8s({
    name: app,
    providers: [provider],
    serviceAccount: null,
    createK8sDeploymentArgs: {
      podArgs: {
        image: 'danielqsj/kafka-exporter',
        args: servers.map((server) => `--kafka.server=${server}`),
        CPURequest: '500m',
        memoryRequest: '500Mi',
        allowSpot: false,
      },
      maxReplicas: 1,
    },
    useTcpProbe: true,

    ports: [{ containerPort: 9308, name: 'metrics' }],
    ingresses: null,
  });

  createPrometheusMonitor({
    name: app,
    provider,
    labels: {
      'app.kubernetes.io/name': app,
    },
    kind: 'Pod',
    endpoints: [{ portName: 'metrics', path: '/metrics', scrapeTimeout: '25s', interval: '30s' }],
    release: 'devops',
    namespaced: false,
  });
}
