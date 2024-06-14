import * as pulumi from '@pulumi/pulumi';
import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider, addWorkloadIdentityUserToSa, createAllowAllNetworkPolicy } from '../k8s';
import { getDevopsImage } from '../cloud-build';
import { getGitSha } from '@tw/devops';
import { createServiceAccount } from '../service';
import { getClickhouseProvider } from '../clickhouse';
import { createConfigMap } from '../k8s/utils';
import { createPrometheusMonitor } from '../prometheus';

export function createKafkaConnectCluster(args: {
  name: string;
  provider: K8sProvider;
  bootstrapServer: pulumi.Input<string>;
  clickhouseConnectorVersion?: string;
}) {
  const { name, provider, bootstrapServer, clickhouseConnectorVersion = '1.1.18' } = args;

  const { serviceAccount } = createServiceAccount({
    name: `kafka-build-${name}`,
    roles: ['roles/artifactregistry.repoAdmin'],
    addDefault: false,
  });

  addWorkloadIdentityUserToSa({
    serviceAccount,
    name: `${name}-connect-build`,
    provider,
  });

  const configMap = createConfigMap({
    name: 'my-connect-config',
    provider,
    data: [
      {
        key: 'config.yaml',
        data: {
          rules: [
            {
              pattern: '.*',
            },
          ],
        },
        type: 'yaml',
      },
    ],
  });

  const cluster = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnect',
      metadata: {
        name,
        annotations: {
          'strimzi.io/use-connector-resources': 'true',
        },
      },
      spec: {
        bootstrapServers: bootstrapServer,
        logging: {
          type: 'inline',
          loggers: {
            // 'rootLogger.level': 'TRACE',
            // 'connect.root.logger.level': 'TRACE',
          },
        },
        replicas: 6,
        resources: {
          requests: {
            cpu: 8,
            memory: '34Gi',
          },
        },
        metricsConfig: {
          type: 'jmxPrometheusExporter',
          valueFrom: {
            configMapKeyRef: {
              name: configMap.metadata.name,
              key: 'config.yaml',
            },
          },
        },

        build: {
          output: {
            type: 'docker',
            image: getDevopsImage(`kafka-connect-${name}`, clickhouseConnectorVersion),
          },
          plugins: [
            {
              name: 'clickhouse',
              artifacts: [
                {
                  type: 'zip',
                  url: `https://storage.googleapis.com/file-hosting-bucket-shofifi/devops/clickhouse-kafka-connect-v${clickhouseConnectorVersion}.zip`,
                },
              ],
            },
          ],
        },
        template: {
          connectContainer: {
            env: [
              {
                name: 'INCLUDE_SOURCE_IN_LOCATION',
                value: 'true',
              },
            ],
          },
          buildServiceAccount: {
            metadata: {
              annotations: {
                'iam.gke.io/gcp-service-account': serviceAccount.email,
              },
            },
          },
        },
      },
    },
    { provider }
  );

  const selector = {
    'strimzi.io/cluster': name,
    'strimzi.io/kind': 'KafkaConnect',
    'strimzi.io/name': `${name}-connect`,
  };

  createPrometheusMonitor({
    name: `kafka-connect-${name}`,
    provider,
    labels: selector,
    release: 'devops',
    endpoints: [
      {
        portName: 'tcp-prometheus',
        interval: '30s',
      },
    ],
  });

  createAllowAllNetworkPolicy(provider);

  return cluster;
}

export function createKafkaConnector(args: {
  name: string;
  clusterName: string;
  provider: K8sProvider;
  topics: string[];
  config: Record<string, pulumi.Input<string | number>>;
  tasksMax?: number;
  className?: string;
}) {
  const {
    name,
    clusterName,
    provider,
    topics,
    config,
    tasksMax = 4,
    className = 'com.clickhouse.kafka.connect.ClickHouseSinkConnector',
  } = args;

  // https://strimzi.io/docs/operators/latest/full/overview#configuration-points-connect_str:~:text=Example%20KafkaConnector%20source%20connector%20configuration
  const connector = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnector',
      metadata: {
        name,
        labels: {
          'strimzi.io/cluster': clusterName,
        },
      },
      spec: {
        class: className,
        tasksMax,
        config: {
          topics: topics.join(','),
          'errors.tolerance': 'all',
          'errors.deadletterqueue.topic.name': `${name}-errors`,
          'errors.deadletterqueue.topic.replication.factor': 1,
          'errors.deadletterqueue.context.headers.enable': 'true',
          'consumer.override.max.poll.records': '10000',
          'fetch.max.wait.ms': `${tasksMax * 1000}`,
          ...config,
        },
      },
    },
    { provider }
  );
  return connector;
}

export function createKafkaConnectorClickhouse(args: {
  name: string;
  provider: K8sProvider;
  topics: string[];
  clusterName?: string;
  tasksMax?: number;
  defaultTable?: pulumi.Input<string>;
  realtimeTable?: pulumi.Input<string>;
  dateField?: pulumi.Input<string>;
  splitDays?: number;
}) {
  const {
    name,
    provider,
    clusterName = 'sonic',
    tasksMax,
    topics,
    defaultTable,
    realtimeTable,
    dateField,
    splitDays,
  } = args;

  const clickhouseProvider = getClickhouseProvider();
  return createKafkaConnector({
    name,
    clusterName,
    provider,
    topics,
    tasksMax,
    config: {
      database: 'sonic_system',
      hostname: clickhouseProvider.host,
      username: clickhouseProvider.username,
      password: clickhouseProvider.password,
      port: '8123',
      defaultTable,
      realtimeTable,
      dateField,
      splitDays,
      'errors.retry.timeout': '60',
      exactlyOnce: 'false',
      ssl: 'false',
      'value.converter': 'org.apache.kafka.connect.json.JsonConverter',
      'value.converter.schemas.enable': 'false',
      'key.converter': 'org.apache.kafka.connect.storage.StringConverter',
      'errors.log.enable': 'true',
      'trace.log.enable': 'false',
    },
  });
}
