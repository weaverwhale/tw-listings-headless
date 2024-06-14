import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import {
  K8sProvider,
  createK8sIngress,
  createK8sNamespace,
  createK8sService,
  createK8sServiceAccount,
} from '../k8s';
import { getSelectorsForPrivatePoolParty } from '../k8s/cluster/nodePool';
import { createPassword } from '../security';
import { TWDomain, getConfigs } from '../utils';
import { createClickCatInstance } from './clickcat';
import { createClickhouseKeeper } from './keeper';
import { toJSONOutput } from '../pulumi-utils';
import { createServiceAccount } from '../service';
import { projectIdAsSubDomain } from '@tw/constants';
import { storeHostedServiceInfo } from '../utils/hostedService';

function createCHUser(args: { name: string; userName: string }) {
  const { name, userName } = args;
  const password = createPassword({ name: `${name}-${userName}`, special: false });
  const entires = {
    [`${userName}/password`]: password.result,
    [`${userName}/networks/ip`]: ['0.0.0.0/0', '::'],
  };
  return { password, entires };
}

export type ClusterInfo = {
  name: string;
  username: string;
  password: pulumi.Input<string>;
  clickCatDomain: string;
  clickhouseTcpDomain: string;
  clickhouseHttpDomain: string;
  replicas: { ip: pulumi.Input<string>; name: string; domain: pulumi.Input<string> }[];
};

export function createClickhouseInstallation(args: {
  name: string;
  userName: string;
  createNamespace?: boolean;
  keeper?: boolean;
  provider: K8sProvider;
  clickCatTag?: string;
  shardsCount?: number;
  replicasCount?: number;
  storageSize?: string;
  storageClass?: string;
  zones?: string[];
  // https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings
  // https://clickhouse.com/docs/en/operations/settings/settings
  settings?: Record<string, string | number | boolean>;
  profileSettings?: Record<string, string | number | boolean>;
  machineFamily?: 'n2' | 'e2' | 'c3d';
  cpus?: number;
  memory?: number;
}) {
  const {
    name,
    userName,
    createNamespace = true,
    keeper = true,
    clickCatTag,
    shardsCount = 1,
    replicasCount = 3,
    settings,
    machineFamily = 'n2',
    cpus = 64,
    memory = 256,
    storageSize = '1000Gi',
    storageClass = 'premium-rwo',
    zones,
    profileSettings,
  } = args;

  let provider = args.provider;

  if (createNamespace) {
    const namespace = createK8sNamespace({ provider: provider, name: provider.namespace });
    provider = provider.dependOn(namespace);
  }

  const { password, entires } = createCHUser({ name, userName });

  const { password: passwordDD, entires: entiresDD } = createCHUser({ name, userName: 'datadog' });

  let { tolerations, nodeSelector } = getSelectorsForPrivatePoolParty({
    friendlyName: `${name}-ch`,
  });

  nodeSelector = {
    ...nodeSelector,
    'cloud.google.com/machine-family': machineFamily,
  } as any;

  if (keeper) {
    const clickhouseKeeper = createClickhouseKeeper({ name, provider, zones });
    provider = provider.dependOn(clickhouseKeeper);
  }

  const { serviceAccount } = createServiceAccount({ name: `${name}-ch` });

  const { k8sServiceAccount } = createK8sServiceAccount({
    name: `${name}-ch`,
    serviceAccount,
    provider,
  });

  const { projectId } = getConfigs();

  const backupBucket = new gcp.storage.Bucket(`${name}-ch-backup`, {
    location: 'us-central1',
    name: `${name}-ch-backup-${projectId}`,
    storageClass: 'STANDARD',
  });

  // https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md
  const clickHouseInstallation = new kubernetes.apiextensions.CustomResource(
    name,
    {
      apiVersion: 'clickhouse.altinity.com/v1',
      kind: 'ClickHouseInstallation',
      metadata: { name },
      spec: {
        defaults: {
          templates: {
            dataVolumeClaimTemplate: name,
            serviceTemplate: name,
          },
        },
        configuration: {
          profiles: {
            ...profileSettings,
          },
          zookeeper: {
            nodes: [{ host: 'clickhouse-keeper', port: 2181 }],
          },
          clusters: [
            {
              name: 'main',
              layout: { shardsCount, replicasCount },
              templates: {
                podTemplate: name,
              },
            },
          ],
          users: {
            ...entires,
            ...entiresDD,
          },
          settings: {
            // https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings
            ...settings,
          },
          files: {
            'http_options_response.xml': `<yandex>
              <http_options_response>
                <header>
                  <name>Access-Control-Allow-Origin</name>
                  <value>*</value>
                </header>
                <header>
                  <name>Access-Control-Allow-Headers</name>
                  <value>*</value>
                </header>
                <header>
                  <name>Access-Control-Expose-Headers</name>
                  <value>*</value>
                </header>
              </http_options_response>
            </yandex>`,
            'logging.xml': `<yandex>
            <logger>
                <level>information</level>
                <log>console</log>
                <errorlog>console</errorlog>
            </logger>
                <asynchronous_insert_log>
                  <database>system</database>
                  <table>asynchronous_insert_log</table>
                  <flush_interval_milliseconds>7500</flush_interval_milliseconds>
                  <partition_by>toYYYYMM(event_date)</partition_by>
                  <max_size_rows>1048576</max_size_rows>
                  <reserved_size_rows>8192</reserved_size_rows>
                  <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
                  <flush_on_crash>false</flush_on_crash>
                </asynchronous_insert_log>
            </yandex>`,
          },
        },
        templates: {
          serviceTemplates: [
            {
              name,
              spec: {
                ports: [
                  { name: 'http', port: 8123 },
                  { name: 'client', port: 9000 },
                ],
                type: 'ClusterIP',
              },
            },
          ],
          podTemplates: [
            {
              name,
              metadata: {
                annotations: {
                  'ad.datadoghq.com/clickhouse.checks': toJSONOutput({
                    clickhouse: {
                      init_config: {},
                      instances: [
                        {
                          server: '%%host%%',
                          port: 9000,
                          username: 'datadog',
                          password: passwordDD.result,
                        },
                      ],
                    },
                  }),
                },
              },
              spec: {
                serviceAccountName: k8sServiceAccount.metadata.name,
                terminationGracePeriodSeconds: 300,
                containers: [
                  {
                    image: 'clickhouse/clickhouse-server:24.5',
                    name: 'clickhouse',
                    resources: {
                      requests: {
                        cpu: String(cpus - 4),
                        memory: `${memory}Gi`,
                      },
                    },
                    livenessProbe: {
                      failureThreshold: 10,
                      httpGet: {
                        path: '/ping',
                        port: 'interserver',
                        scheme: 'HTTP',
                      },
                      initialDelaySeconds: 60,
                      periodSeconds: 3,
                      successThreshold: 1,
                      timeoutSeconds: 1,
                    },
                    readinessProbe: {
                      failureThreshold: 10,
                      httpGet: {
                        path: '/ping',
                        port: 'interserver',
                        scheme: 'HTTP',
                      },
                      initialDelaySeconds: 10,
                      periodSeconds: 3,
                      successThreshold: 1,
                      timeoutSeconds: 1,
                    },

                    volumeMounts: [
                      {
                        name,
                        mountPath: '/var/lib/clickhouse',
                      },
                    ],
                  },
                ],
                nodeSelector,
                tolerations,
              },
            },
          ],
          volumeClaimTemplates: [
            {
              name,
              spec: {
                storageClassName: storageClass,
                accessModes: ['ReadWriteOnce'],
                resources: { requests: { storage: storageSize } },
              },
            },
          ],
        },
      },
    },
    { provider, dependsOn: [...provider.dependsOn], protect: false }
  );

  provider = provider.dependOn(clickHouseInstallation);

  const clickSelector = {
    'clickhouse.altinity.com/app': 'chop',
    'clickhouse.altinity.com/chi': name,
    'clickhouse.altinity.com/namespace': provider.namespace,
    'clickhouse.altinity.com/ready': 'yes',
  };

  const internalDomain = new TWDomain('whaledb.io', `${name}.clickhouse`, 'internal');

  const internalHttpDomain = new TWDomain('whaledb.io', `${name}-http.clickhouse`, 'internal');

  const clickcatDomain = new TWDomain(
    'whaledb.io',
    `${name}.clickcat`,
    'iap',
    projectIdAsSubDomain
  );

  createK8sService({
    name: `${name}-clickhouse`,
    provider,
    ingressMode: 'internal',
    type: 'LoadBalancer',
    selector: clickSelector,
    ports: [
      { port: 8123, targetPort: 8123, name: 'http' },
      { port: 9000, targetPort: 9000, name: 'client' },
    ],
    twDomain: internalDomain,
    dependsOn: provider.dependsOn,
  });

  createK8sIngress({
    name: `${name}-clickhouse-http`,
    provider,
    ingressMode: 'internal',
    selector: clickSelector,
    port: 8123,
    targetPort: 8123,
    twDomain: internalHttpDomain,
    dependsOn: provider.dependsOn,
    sessionAffinity: 'GENERATED_COOKIE',
  });

  const clusterInfo: ClusterInfo = {
    name,
    username: userName,
    password: password.result,
    clickCatDomain: clickcatDomain.fqdn,
    clickhouseTcpDomain: internalDomain.fqdn,
    clickhouseHttpDomain: internalHttpDomain.fqdn,
    replicas: [],
  };

  const { domain } = createClickCatInstance({
    name,
    userName,
    password,
    provider,
    clickSelector,
    shardsCount,
    replicasCount,
    clusterInfo,
    tag: clickCatTag,
    domain: clickcatDomain,
  });

  storeHostedServiceInfo({
    name,
    type: 'clickhouse',
    data: clusterInfo,
  });

  return { clickHouseInstallation, password, internalDomain, domain, internalHttpDomain };
}
