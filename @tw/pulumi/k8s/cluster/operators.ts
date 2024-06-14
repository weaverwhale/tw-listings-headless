import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider, getK8sProvider } from '../provider';
import { createServiceAccount } from '../../service';
import { addWorkloadIdentityUserToSa, createK8sServiceAccount } from '../sa';
import { createK8sNamespace } from '../namespace';
import { createHorizontalPodAutoScaler } from '../autoscaling';
import { createK8sService } from '../service';
import { TWDomain } from '../../utils';
import { createPrometheusMonitor } from '../../prometheus/monitor';
import { cuda } from './cuda';
import { createK8sIngress } from '../ingress';
import { projectIdAsSubDomain } from '@tw/constants';
import { createPassword } from '../../security';
import { createHelmRelease } from '../helm';
import { createK8sServiceBackendConfig } from '../gke';
import { isProduction } from '../../constants';
import { getClusterRoot } from './utils';
import { createGrafanaDataSource } from '../../grafana/dataSource';

type BaseArgs = {
  provider?: K8sProvider;
};

type OperatorsResult = {
  resources: pulumi.Resource[];
};

const clusterOperators: Record<
  string,
  Partial<Record<keyof typeof k8sClusterOperators, pulumi.Resource[]>>
> = {};

const dirname = getClusterRoot();

function secretsCsi(args: BaseArgs): OperatorsResult {
  const { provider } = args;
  const secretsProvider = new kubernetes.yaml.ConfigFile(
    `gcp-provider-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/provider-gcp-plugin.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider }
  );
  const secretsCsi = createHelmRelease({
    name: `scsi-${provider.uuid}`,
    releaseArgs: {
      chart: 'secrets-store-csi-driver',
      name: 'scsi',
      namespace: 'kube-system',
      repositoryOpts: {
        repo: 'https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts',
      },
    },
    provider,
  });
  return { resources: [secretsCsi, secretsProvider] };
}

function autoneg(args: BaseArgs): OperatorsResult {
  const { provider } = args;
  const { serviceAccount } = createServiceAccount({
    name: `autoneg-${provider.uuid}`,
    addDefault: false,
    roles: ['roles/compute.networkUser', 'roles/compute.admin'],
  });

  const autonegProvider = getK8sProvider({
    provider,
    namespace: 'autoneg-system',
  });

  createK8sNamespace({ name: 'autoneg-system', provider });

  const { k8sServiceAccount } = createK8sServiceAccount({
    name: 'autoneg-controller-manager',
    serviceAccount,
    provider: autonegProvider,
  });

  const resource = new kubernetes.yaml.ConfigFile(
    `autoneg-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/autoneg.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider: autonegProvider, dependsOn: [k8sServiceAccount, ...provider.dependsOn] }
  );

  return { resources: [resource] };
}

function prometheus(args: BaseArgs & { grafana?: boolean }): OperatorsResult {
  const { provider, grafana = true } = args;

  new kubernetes.rbac.v1.ClusterRole(
    `prometheus-${provider.uuid}`,
    {
      metadata: { name: 'prometheus' },
      rules: [
        {
          apiGroups: [''],
          resources: [
            'nodes',
            'nodes/metrics',
            'services',
            'endpoints',
            'pods',
            'configmaps',
            'ingresses',
          ],
          verbs: ['get', 'list', 'watch'],
        },
        {
          nonResourceURLs: ['/metrics'],
          verbs: ['get'],
        },
      ],
    },
    { provider: provider }
  );

  const prometheusHelm = createHelmRelease({
    name: `prometheus-${provider.uuid}`,
    releaseArgs: {
      chart: 'kube-prometheus-stack',
      name: 'kube-prometheus-stack',
      namespace: provider.namespace,
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/prometheus/values.yaml`)],
      values: {
        grafana: {
          enabled: grafana,
          persistence: {
            enabled: true,
            type: 'sts',
            storageClassName: 'standard-rwo',
            accessModes: ['ReadWriteOnce'],
            size: '20Gi',
            finalizers: ['kubernetes.io/pvc-protection'],
          },
        },
        prometheus: {
          prometheusSpec: {
            resources: {
              requests: { cpu: isProduction ? 4 : 1, memory: isProduction ? '8Gi' : '2Gi' },
            },
            storageSpec: {
              volumeClaimTemplate: {
                spec: {
                  accessModes: ['ReadWriteOnce'],
                  resources: {
                    requests: {
                      storage: isProduction ? '500Gi' : '100Gi',
                    },
                  },
                },
              },
            },
          },
        },
      },
      repositoryOpts: {
        repo: 'https://prometheus-community.github.io/helm-charts',
      },
    },
    provider,
  });

  if (grafana) {
    createK8sIngress({
      name: `grafana-${provider.uuid}`,
      provider: provider,
      selector: {
        'app.kubernetes.io/instance': 'kube-prometheus-stack',
        'app.kubernetes.io/name': 'grafana',
      },
      twDomain: new TWDomain(
        'triplestack.io',
        `${provider.cluster_name}.grafana`,
        'iap',
        projectIdAsSubDomain
      ),
      port: 80,
      targetPort: 3000,
      healthCheckPath: '/api/health',
      ingressMode: 'iap',
      dependsOn: [prometheusHelm],
    });
    createK8sService({
      name: `grafana-internal`,
      provider: provider,
      twDomain: new TWDomain('triplestack.io', `${provider.cluster_name}.grafana`, 'internal'),
      selector: {
        'app.kubernetes.io/instance': 'kube-prometheus-stack',
        'app.kubernetes.io/name': 'grafana',
      },
      ingressMode: 'internal',
      type: 'LoadBalancer',
      ports: [{ targetPort: 3000, port: 80 }],
      dependsOn: [prometheusHelm],
    });
  } else {
    const twDomain = new TWDomain(
      'triplestack.io',
      `${provider.cluster_name}.${provider.location}.prometheus`,
      'internal'
    );
    createK8sService({
      name: `prometheus`,
      provider: provider,
      twDomain,
      selector: {
        'app.kubernetes.io/instance': 'kube-prometheus-stack-prometheus',
        'app.kubernetes.io/name': 'prometheus',
      },
      ingressMode: 'internal',
      type: 'LoadBalancer',
      ports: [{ targetPort: 9090, port: 9090 }],
      dependsOn: [prometheusHelm],
    });

    createGrafanaDataSource({
      name: `kube-prometheus-stack-${provider.cluster_name}-${provider.location}`,
      url: `http://${twDomain.fqdn}:9090`,
      type: 'prometheus',
      jsonData: {
        httpMethod: 'POST',
      },
    });
  }

  return { resources: [prometheusHelm] };
}

function grafana(args: BaseArgs): OperatorsResult & { password: pulumi.Output<string> } {
  const { provider } = args;
  const password = createPassword({ name: 'grafana-admin-password' });
  new kubernetes.core.v1.Secret(
    `grafana-${provider.uuid}`,
    {
      metadata: { name: 'grafana-admin-secret' },
      stringData: {
        'admin-user': 'admin',
        'admin-password': password.result,
      },
    },
    { provider: provider }
  );
  const grafanaHelm = createHelmRelease({
    name: `grafana-${provider.uuid}`,
    releaseArgs: {
      chart: 'grafana',
      name: 'grafana',
      namespace: provider.namespace,
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/grafana/values.yaml`)],
      repositoryOpts: {
        repo: 'https://grafana.github.io/helm-charts',
      },
    },
    provider,
  });

  createK8sIngress({
    name: `grafana-${provider.uuid}`,
    provider: provider,
    selector: {
      'app.kubernetes.io/instance': 'grafana',
      'app.kubernetes.io/name': 'grafana',
    },
    twDomain: new TWDomain('whale3.io', 'grafana', 'iap', projectIdAsSubDomain),
    port: 80,
    targetPort: 3000,
    healthCheckPath: '/api/health',
    ingressMode: 'iap',
    dependsOn: [grafanaHelm],
  });

  return { resources: [grafanaHelm], password: password.result };
}

export function knativeServing(args: BaseArgs): OperatorsResult {
  const { provider } = args;
  const servingProvider = getK8sProvider({
    provider: provider,
    namespace: 'knative-serving',
  });

  const { serviceAccount } = createServiceAccount({
    name: `knative-${provider.uuid}`,
    addDefault: false,
    roles: ['roles/artifactregistry.reader'],
  });

  createK8sServiceAccount({
    name: 'controller',
    serviceAccount,
    provider: servingProvider,
  });

  const servingCore = new kubernetes.yaml.ConfigFile(
    `serving-core-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/serving-core.yaml`,
      resourcePrefix: provider.cluster_uuid,
      transformations: [
        (o, opts) => {
          const name =
            'core-' + (o.metadata.namespace ? o.metadata.namespace + '/' : '') + o.metadata.name;
          opts.aliases = [{ name: name }];
        },
      ],
    },
    { provider, dependsOn: provider.dependsOn }
  );

  const servingHpa = new kubernetes.yaml.ConfigFile(
    `serving-hpa-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/serving-hpa.yaml`,
      resourcePrefix: provider.cluster_uuid,
      transformations: [
        (o, opts) => {
          const name =
            'hpa-' + (o.metadata.namespace ? o.metadata.namespace + '/' : '') + o.metadata.name;
          opts.aliases = [{ name: name }];
        },
      ],
    },
    { provider, dependsOn: provider.dependsOn }
  );

  createPrometheusMonitor({
    release: 'devops',
    name: 'controller',
    provider: servingProvider,
    endpoints: [{ portName: 'metrics' }],
    labels: { app: 'controller' },
  });

  createPrometheusMonitor({
    release: 'devops',
    name: 'autoscaler',
    provider: servingProvider,
    endpoints: [{ portName: 'metrics' }],
    labels: { app: 'autoscaler' },
  });

  createPrometheusMonitor({
    release: 'devops',
    name: 'activator',
    provider: servingProvider,
    endpoints: [{ portName: 'metrics' }],
    labels: { app: 'activator' },
  });

  createPrometheusMonitor({
    release: 'devops',
    name: 'webhook',
    provider: servingProvider,
    endpoints: [{ portName: 'metrics' }],
    labels: { app: 'webhook' },
  });
  return { resources: [servingCore, servingHpa] };
}

export function kourier(args: BaseArgs & { minReplicas?: number }): OperatorsResult {
  const { provider, minReplicas = 1 } = args;
  const kourier = new kubernetes.yaml.ConfigFile(
    `kourier-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/kourier.yaml`,
      resourcePrefix: provider.cluster_uuid,
      transformations: [
        (o, opts) => {
          const name =
            'kourier-' + (o.metadata.namespace ? o.metadata.namespace + '/' : '') + o.metadata.name;
          opts.aliases = [{ name: name }];
        },
      ],
    },
    { provider, aliases: [{ name: 'kourier-kourier' }], dependsOn: provider.dependsOn }
  );

  const kourierProvider = getK8sProvider({
    provider: provider,
    namespace: 'kourier-system',
  });

  // createPrometheusMonitor({
  //   name: 'net-kourier-controller',
  //   provider: kourierProvider,
  //   port: 'metrics',
  //   path: '/stats/prometheus',
  //   labels: { app: 'net-kourier-controller' },
  // });
  // createPrometheusMonitor({
  //   name: '3scale-kourier-gateway',
  //   provider: kourierProvider,
  //   port: 'metrics',
  //   path: '/stats/prometheus',
  //   labels: { app: '3scale-kourier-gateway' },
  // });

  createHorizontalPodAutoScaler({
    name: '3scale-kourier-gateway',
    kind: 'Deployment',
    maxReplicas: 1000,
    minReplicas: minReplicas,
    provider: kourierProvider,
    averageCPUUtilization: 65,
    scaleDownPolicies: [
      {
        type: 'Percent',
        periodSeconds: 60,
        value: 5,
      },
    ],
  });

  createK8sServiceBackendConfig({
    name: 'kourier-lb-internal',
    provider: kourierProvider,
    spec: { connectionDraining: { drainingTimeoutSec: 600 } },
  });

  if (provider.cluster_name === 'knative-cluster') {
    createK8sService({
      name: `kourier-internal-pass-through`,
      selector: { app: '3scale-kourier-gateway' },
      type: 'LoadBalancer',
      ingressMode: 'internal',
      provider: kourierProvider,
      twDomain: new TWDomain('whale3.io', 'kourier', 'internal'),
    });
  }
  createK8sService({
    name: `kourier-internal-l4`,
    selector: { app: '3scale-kourier-gateway' },
    type: 'LoadBalancer',
    ingressMode: 'internal',
    provider: kourierProvider,
    twDomain: new TWDomain(
      'whale3.io',
      `kourier-${provider.cluster_name}-${provider.location}`,
      'internal'
    ),
  });
  return { resources: [kourier] };
}

function clickhouseOperator(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  createK8sNamespace({ name: provider.namespace, provider });

  const clickhouseOperator = new kubernetes.yaml.ConfigFile(
    `clickhouse-operator-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/clickhouse-operator.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  createPrometheusMonitor({
    kind: 'Service',
    release: 'devops',
    name: 'clickhouse-operator',
    provider,
    endpoints: [{ portName: 'clickhouse-metrics' }, { portName: 'operator-metrics' }],
    labels: { app: 'clickhouse-operator' },
  });

  return { resources: [clickhouseOperator] };
}

function certManager(args: BaseArgs): OperatorsResult {
  const { provider } = args;
  const certManager = new kubernetes.yaml.ConfigFile(
    `cert-manager-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/cert-manager.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  return { resources: [certManager] };
}

function jaeger(args: BaseArgs): OperatorsResult {
  let { provider } = args;
  provider = dependOnK8sClusterOperators(provider, ['certManager']);
  const jaeger = new kubernetes.yaml.ConfigFile(
    `jaeger-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/jaeger-operator.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  return { resources: [jaeger] };
}

function elasticOperator(args: BaseArgs): OperatorsResult {
  let provider = args.provider;
  provider = provider.dependOn(createK8sNamespace({ name: 'elastic-system', provider }));
  const eckCrds = new kubernetes.yaml.ConfigFile(
    `eck-crds-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/eck/crds.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  const eckOperator = new kubernetes.yaml.ConfigFile(
    `eck-operator-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/eck/operator.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  return { resources: [eckCrds, eckOperator] };
}

function keda(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  // https://keda.sh/docs/2.10/troubleshooting/#google-kubernetes-engine-gke

  const kedaHelm = createHelmRelease({
    provider,
    name: `keda-${provider.uuid}`,
    releaseArgs: {
      chart: 'keda',
      name: 'keda',
      namespace: 'keda',
      createNamespace: true,
      repositoryOpts: {
        repo: 'https://kedacore.github.io/charts',
      },
    },
  });
  return { resources: [kedaHelm] };
}

function openTelemetry(args: BaseArgs): OperatorsResult {
  let { provider } = args;
  provider = dependOnK8sClusterOperators(provider, ['certManager']);
  const otelHelm = createHelmRelease({
    provider,
    name: `otel-${provider.uuid}`,
    releaseArgs: {
      chart: 'opentelemetry-operator',
      name: 'otel',
      namespace: provider.namespace,
      createNamespace: true,
      valueYamlFiles: [
        new pulumi.asset.FileAsset(`${dirname}/helm/charts/opentelemetry/values.yaml`),
      ],
      repositoryOpts: {
        repo: 'https://open-telemetry.github.io/opentelemetry-helm-charts',
      },
    },
  });
  return { resources: [otelHelm] };
}

function rabbitmq(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  const rabbitmq = new kubernetes.yaml.ConfigFile(
    `rabbitmq-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/rabbitmq.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );
  return { resources: [rabbitmq] };
}

function flinkOperator(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  const flinkOperator = createHelmRelease({
    name: `flink-${provider.uuid}`,
    releaseArgs: {
      chart: 'flink-kubernetes-operator',
      name: 'flink-operato',
      namespace: 'flink-operator',
      createNamespace: true,
      repositoryOpts: {
        repo: 'https://downloads.apache.org/flink/flink-kubernetes-operator-1.7.0',
      },
    },
    provider,
  });
  return { resources: [flinkOperator] };
}

export function cudaDriver(args: BaseArgs): OperatorsResult {
  const res = cuda(args.provider);
  return { resources: [res] };
}

export function contour(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  const contour = new kubernetes.yaml.ConfigFile(
    `contour-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/contour.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  const newContour = new kubernetes.yaml.ConfigFile(
    `net-contour-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/net-contour.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );
  return { resources: [contour, newContour] };
}

function kafkaOperator(args: BaseArgs): OperatorsResult {
  const provider = getK8sProvider({
    provider: args.provider,
    namespace: 'kafka',
  });

  createK8sNamespace({ name: 'kafka', provider });

  const kafka = new kubernetes.yaml.ConfigFile(
    `kafka-operator-${provider.cluster_uuid}`,
    {
      file: `${dirname}/yamls/kafka.yaml`,
      resourcePrefix: provider.cluster_uuid,
    },
    { provider, dependsOn: provider.dependsOn }
  );

  return { resources: [kafka] };
}

function dagster(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  const dagster = createHelmRelease({
    name: `dagster-${provider.uuid}`,
    releaseArgs: {
      chart: 'dagster',
      namespace: 'dagster',
      name: 'dagster',
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/dagster/values.yaml`)],
      repositoryOpts: {
        repo: 'https://dagster-io.github.io/helm',
      },
    },
    provider,
  });
  return { resources: [dagster] };
}

function signoz(args: BaseArgs): OperatorsResult {
  const { provider } = args;

  const signoz = createHelmRelease({
    name: `signoz-${provider.uuid}`,
    releaseArgs: {
      chart: 'signoz',
      namespace: 'signoz',
      name: 'signoz',
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/signoz/values.yaml`)],
      repositoryOpts: {
        repo: 'https://charts.signoz.io',
      },
    },
    provider,
  });

  const selector = {
    'app.kubernetes.io/component': 'frontend',
    'app.kubernetes.io/instance': 'signoz',
    'app.kubernetes.io/name': 'signoz',
  };

  createK8sIngress({
    name: `signoz-${provider.uuid}`,
    provider: getK8sProvider({ provider, namespace: 'signoz' }),
    selector,
    twDomain: new TWDomain('triplestack.io', `signoz`, 'iap', projectIdAsSubDomain),
    port: 80,
    targetPort: 3301,
    healthCheckPath: '/',
    ingressMode: 'iap',
    dependsOn: [signoz],
  });

  return { resources: [signoz] };
}

const k8sClusterOperators = {
  secretsCsi,
  autoneg,
  prometheus,
  grafana,
  knativeServing,
  kourier,
  keda,
  openTelemetry,
  cudaDriver,
  rabbitmq,
  clickhouseOperator,
  contour,
  certManager,
  flinkOperator,
  kafkaOperator,
  dagster,
  jaeger,
  elasticOperator,
  signoz,
};

export function installK8sClusterOperator<C extends keyof typeof k8sClusterOperators>(
  name: C,
  args: Parameters<(typeof k8sClusterOperators)[C]>[0] | undefined
) {
  if (!clusterOperators[args.provider.cluster_name]) {
    clusterOperators[args.provider.cluster_name] = {};
  }
  const res = k8sClusterOperators[name](args as any);
  if (res?.resources) clusterOperators[args.provider.cluster_name][name] = res.resources;
  return res;
}

export function dependOnK8sClusterOperators(
  provider: K8sProvider,
  operators: (keyof typeof k8sClusterOperators)[]
): K8sProvider {
  const dependsOn: pulumi.Resource[] = [];
  for (const operator of operators) {
    const operatorResources = clusterOperators[provider.cluster_name]?.[operator];
    if (operatorResources) {
      dependsOn.push(...operatorResources);
    }
  }
  return provider.dependOn(dependsOn);
}
