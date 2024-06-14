import { createOtelCollector } from '../otel';
import { createPrometheusDeployment } from '../prometheus';
import { createK8sNamespace } from './namespace';
import { K8sProvider, getK8sProvider } from './provider';

export function createObservabilityStack(args: {
  name: string;
  provider: K8sProvider;
  otel?: boolean;
  devopsPrometheus?: boolean;
}) {
  const { name, otel = true, devopsPrometheus = true } = args;

  createK8sNamespace({ name: 'monitoring', provider: args.provider });
  createK8sNamespace({ name: 'observability', provider: args.provider });

  const monitoringProvider = getK8sProvider({ provider: args.provider, namespace: 'monitoring' });

  if (devopsPrometheus) {
    createPrometheusDeployment({
      name: 'devops',
      provider: monitoringProvider,
    });
  }

  if (otel) {
    const observabilityProvider = getK8sProvider({
      provider: args.provider,
      namespace: 'observability',
    });

    createPrometheusDeployment({
      name: 'workloads',
      provider: monitoringProvider,
    });

    createOtelCollector({
      name: `${name}-otel`,
      provider: observabilityProvider,
      mode: 'daemonset',
      createLb: true,
      debug: false,
    });
  }
}
