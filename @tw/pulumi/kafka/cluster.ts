import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import {
  K8sCPU,
  K8sMemory,
  K8sProvider,
  createK8sService,
  deployToK8s,
  resourceCalc,
} from '../k8s';
import { TWDomain, enumerateNumber } from '../utils';
import { projectIdAsSubDomain } from '@tw/constants';
import { storeHostedServiceInfo } from '../utils/hostedService';
import { createKafkaExporter } from '../k8s/apps/kafkaExporter';
import { toYamlOutput } from '../pulumi-utils';
import { createConfigMap } from '../k8s/utils';

type ClusterInfo = {
  name: string;
  consoleDomain: string;
  bootstrapDomain: pulumi.Input<string>;
  brokerDomains: pulumi.Input<string>[];
};

export function createKafkaCluster(args: {
  name: string;
  provider: K8sProvider;
  replicasNumber: number;
  CPURequest: K8sCPU;
  memoryRequest: K8sMemory;
  storageSize?: string;
  config?: Record<string, any>;
}) {
  const { name, replicasNumber = 3, storageSize = '1000Gb', config } = args;

  const { CPULimit, CPURequest, memoryRequest, memoryLimit } = resourceCalc({
    CPURequest: args.CPURequest,
    memoryRequest: args.memoryRequest,
  });
  let provider = args.provider;
  const domain = new TWDomain('triplestack.io', `${name}-bootstrap.kafka`, 'internal');
  const brokers: {
    domain: TWDomain;
    replica: number;
  }[] = [];
  for (const replica of enumerateNumber(replicasNumber)) {
    const brokerDomain = new TWDomain(
      'triplestack.io',
      `${name}-broker-${replica}.kafka`,
      'internal'
    );
    brokers.push({
      domain: brokerDomain,
      replica,
    });
  }

  // https://strimzi.io/docs/operators/latest/configuring
  const deployment = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'Kafka',
      metadata: {
        name,
      },
      spec: {
        kafka: {
          replicas: replicasNumber,
          resources: {
            requests: {
              cpu: CPURequest,
              memory: memoryRequest,
            },
            limits: {
              cpu: CPULimit,
              memory: memoryLimit,
            },
          },
          listeners: [
            {
              name: 'plain',
              port: 9092,
              type: 'internal',
              tls: false,
              configuration: {
                brokers: brokers.map(({ domain, replica }) => ({
                  advertisedHost: domain.fqdn,
                  broker: replica,
                })),
              },
              networkPolicyPeers: [],
            },
            {
              name: 'tls',
              port: 9093,
              type: 'internal',
              tls: true,
              networkPolicyPeers: [],
            },
          ],
          // https://docs.aws.amazon.com/msk/latest/developerguide/msk-configuration-properties.html
          config: {
            'offsets.topic.replication.factor': 1,
            'transaction.state.log.replication.factor': 1,
            'transaction.state.log.min.isr': 1,
            'default.replication.factor': 1,
            'min.insync.replicas': 1,
            'inter.broker.protocol.version': '3.7',
            'num.recovery.threads.per.data.dir': 10,
            ...config,
          },
          storage: {
            type: 'jbod',
            volumes: [
              {
                id: 0,
                type: 'persistent-claim',
                size: storageSize,
                deleteClaim: false,
              },
            ],
          },
          jmxOptions: {},
          template: {
            pod: {
              terminationGracePeriodSeconds: 180,
            },
          },
        },
        zookeeper: {
          replicas: 3,
          resources: {
            requests: {
              cpu: '200m',
              memory: '2Gi',
            },
            limits: {
              cpu: '800m',
              memory: '4Gi',
            },
          },
          jmxOptions: {},
          storage: {
            type: 'persistent-claim',
            size: '100Gi',
            deleteClaim: false,
          },
        },
      },
    },
    { provider }
  );

  provider = provider.dependOn(deployment);

  const ports = [
    {
      name: 'plain',
      port: 9092,
      targetPort: 9092,
    },
    {
      name: 'tls',
      port: 9093,
      targetPort: 9093,
    },
  ];

  const selector = {
    'strimzi.io/cluster': name,
    'strimzi.io/component-type': 'kafka',
    'strimzi.io/kind': 'Kafka',
  };

  createK8sService({
    name: `${name}-bootstrap`,
    twDomain: domain,
    selector,
    type: 'LoadBalancer',
    ingressMode: 'internal',
    provider,
    ports,
  });

  for (const { domain, replica } of brokers) {
    createK8sService({
      name: `${name}-broker-${replica}`,
      twDomain: domain,
      selector: {
        ...selector,
        'strimzi.io/pod-name': `${name}-kafka-${replica}`,
      },
      type: 'LoadBalancer',
      ingressMode: 'internal',
      provider,
      ports,
    });
  }

  const consoleDomain = new TWDomain(
    'triplestack.io',
    `${name}.console`,
    'internal',
    projectIdAsSubDomain
  );

  const configYaml = {
    connect: {
      enabled: true,
      clusters: [
        {
          name: 'sonic',
          url: 'http://sonic-connect-api.kafka-connect.svc.cluster.local:8083',
          tls: {
            enabled: false,
          },
        },
      ],
    },
  };

  const configMap = createConfigMap({
    name: `${name}-console-config`,
    provider,
    data: [
      {
        key: 'redpanda-console-config.yaml',
        data: configYaml,
        type: 'yaml',
      },
    ],
  });

  deployToK8s({
    name: `${name}-console`,
    serviceAccount: null,
    createK8sDeploymentArgs: {
      envs: {
        KAFKA_BROKERS: `${domain.fqdn}:9092`,
        CONFIG_FILEPATH: '/etc/redpanda/redpanda-console-config.yaml',
      },
      podArgs: {
        image: 'docker.redpanda.com/redpandadata/console:v2.6.0',
        allowSpot: false,
        extraVolumes: [
          {
            configMap: {
              name: configMap.metadata.name,
            },
            path: '/etc/redpanda',
            name: 'redpanda-console-config',
          },
        ],
      },
      maxReplicas: 1,
    },
    domain: consoleDomain,
    ingresses: [
      { ingressType: 'service', ingressMode: 'internal' },
      { ingressType: 'ingress', ingressMode: 'iap' },
    ],
    providers: [provider],
  });

  createKafkaExporter({
    provider,
    name,
    servers: brokers.map(({ domain }) => domain.fqdn + ':9092'),
  });

  const clusterInfo: ClusterInfo = {
    name,
    consoleDomain: consoleDomain.fqdn,
    bootstrapDomain: domain.fqdn,
    brokerDomains: brokers.map(({ domain }) => domain.fqdn),
  };

  storeHostedServiceInfo({
    name,
    type: 'kafka',
    data: clusterInfo,
  });
  return { deployment, clusterInfo };
}
