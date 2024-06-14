import * as kubernetes from '@pulumi/kubernetes';
import { getK8sProvider, K8sProvider } from '../k8s/provider';
import { deepMerge } from '@tw/helpers';
import { k8sUniqueName } from '../k8s/utils';

export type PrometheusReleaseName = 'devops' | 'workloads' | 'kube-prometheus-stack';

export function createPrometheusMonitor(args: {
  name: string;
  release: PrometheusReleaseName;
  provider: K8sProvider;
  endpoints: {
    interval?: string;
    portName: string;
    path?: string;
    scrapeTimeout?: string;
  }[];
  kind?: 'Pod' | 'Service';
  labels: Record<string, string>;
  namespaced?: boolean;
}) {
  const {
    name,
    endpoints,
    provider = getK8sProvider(),
    labels,
    kind = 'Pod',
    release,
    namespaced = true,
  } = args;

  const uniqueName = k8sUniqueName(name, provider);
  let opts: kubernetes.apiextensions.CustomResourceArgs = {
    metadata: {
      name: uniqueName,
    },
    spec: {
      selector: {
        matchLabels: labels,
      },
    },
  } as any;

  endpoints.forEach((endpoint: any) => {
    endpoint.interval = endpoint.interval || '30s';
    endpoint.path = endpoint.path || '/metrics';
    endpoint.port = endpoint.portName;
    delete endpoint.portName;
  });

  const namespaceSelector: any = {};

  if (namespaced) {
    namespaceSelector.matchNames = [provider.namespace];
  } else {
    namespaceSelector.any = true;
  }

  // https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.PodMonitor
  opts = deepMerge(opts, {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: `${kind}Monitor`,
    metadata: {
      labels: {
        release,
      },
    },
    spec: {
      namespaceSelector,
    },
  });
  if (kind === 'Pod') {
    opts.spec.podMetricsEndpoints = endpoints;
  } else if (kind === 'Service') {
    opts.spec.endpoints = endpoints;
  }

  new kubernetes.apiextensions.CustomResource(uniqueName, opts, {
    provider,
    aliases: [{ name }],
  });
}
