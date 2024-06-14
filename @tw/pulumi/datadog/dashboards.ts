import * as pulumi from '@pulumi/pulumi';
import * as datadog from '@pulumi/datadog';
import { DashboardWidget } from '@pulumi/datadog/types/output';
import moment from 'moment';
import { monitoringState } from '../monitoring/state';
import { getConfigs } from '../utils';
import { getDatadogProvider } from './provider';
import { setPos } from './utils';
import { DatadogResources } from './types';
import { globalState } from '../utils/globalState';
import { deployedToK8s } from '../service';
import { getAuthor } from '../monitoring';

const pos = getNewPos();

export function getNewPos() {
  return { x: 0, y: 0 };
}

export function createDefaultDatadogDashboard(thisPos?: { x: number; y: number }) {
  thisPos = thisPos || pos;
  const { serviceId, serviceConfig } = getConfigs();

  let description = `Maintainers: \`${serviceConfig.maintainers?.join(', ')}\` \n
  Last deploy: ${moment().toLocaleString()} by ${getAuthor() || 'unknown'}`;

  if (process.env.IS_CLOUD_BUILD) {
    description += ` [build](https://console.cloud.google.com/cloud-build/builds;region=${process.env.LOCATION}/${process.env.BUILD_ID}?project=${process.env.PROJECT_ID})`;
  } else {
    description += ' (local)';
  }
  const links = [];

  if (deployedToK8s) {
    links.push(...getLinks(['logs', 'k8s', 'apm']));
  } else {
    links.push(...getLinks(['logs']));
    links.push(
      `[Cloud Run](https://console.cloud.google.com/run?project=$project_id.value&pageState=(%22cloudRunServicesTable%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22service-id_3A${serviceId}_5C_22_22_2C_22s_22_3Atrue%257D%255D%22)))`
    );
  }

  const maxReplicas = [...(globalState['kubernetes:serving.knative.dev/v1:Service'] || [])].map(
    (deployment) => {
      return {
        name: deployment.props.metadata.name,
        max: String(
          deployment.props.spec.template.metadata.annotations['autoscaling.knative.dev/max-scale']
        ),
      };
    }
  );

  const widgets: Partial<DashboardWidget>[] = [
    setPos(thisPos, {
      noteDefinition: {
        content: links.join('\n\r'),
        fontSize: '14',
        textAlign: 'center',
        verticalAlign: 'center',
        hasPadding: false,
      },
      widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
    }),
  ];
  const templateVariables = [
    {
      name: 'project_id',
      prefix: 'project_id',
      availableValues: ['shofifi', 'triple-whale-staging'],
      defaults: ['shofifi'],
    },
    { name: 'resource_name', prefix: 'resource_name', availableValues: [], defaults: ['*'] },
    {
      name: 'deployment',
      prefix: 'kube_deployment',
      availableValues: [],
      defaults: ['*'],
    },
    {
      name: 'pipeline',
      prefix: 'pipeline',
      availableValues: [],
      defaults: ['*'],
    },
  ];
  const data: datadog.DashboardArgs = {
    title: `${serviceId} default`,
    description,
    templateVariables,
    layoutType: 'ordered',
    notifyLists: [],
    reflowType: 'fixed',
  };

  if (monitoringState.temporal.enabled) {
    widgets.push(...getDatadogWidgets('temporal'));
    widgets.push(...getDatadogWidgets('k8s'));
    if (monitoringState.apmHttp.enabled) {
      widgets.push(...getDatadogWidgets('apmHttp'));
    }
    widgets[0].noteDefinition.content += `\n\r${getTemporalLink()}`;
    const temporalNamespace = getTemporalNamespace();
    const temporalNamespaceUnderscore = temporalNamespace.replaceAll('-', '_');
    widgets[0].noteDefinition.content += `\n\r[Detailed dashboard](https://us5.datadoghq.com/dashboard/3fk-6sf-8nq/temporal-detailed?tpl_var_k8s_namespace%5B0%5D=${serviceId}-ns&tpl_var_service_id%5B0%5D=${serviceId}&tpl_var_temporal_namespace_underscore%5B0%5D=${temporalNamespaceUnderscore}&tpl_var_temporal_namespace%5B0%5D=${temporalNamespace})`;
  } else if (deployedToK8s) {
    if (monitoringState.apmHttp.enabled) {
      widgets.push(...getDatadogWidgets('apmHttp'));
    }
    widgets.push(...getDatadogWidgets('k8s'));
  } else {
    if (globalState['gcp:cloudrun/service:Service']?.length) {
      widgets.push(...getDatadogWidgets('cloudRun'));
    }
  }

  if (monitoringState.saber.enabled) {
    widgets[0].noteDefinition.content += `\n\r[Saber Apm](https://us5.datadoghq.com/apm/services/${serviceId}-saber/operations/saber.process/resources?env=$project_id.value)`;
    widgets.push(...getDatadogWidgets('saber'));
  }

  if (monitoringState.pubsub.enabled) {
    widgets.push(...getDatadogWidgets('pubsub'));
    templateVariables.push({
      name: 'subscription_id',
      prefix: 'subscription_id',
      availableValues: [],
      defaults: ['*'],
    });
    widgets[0].noteDefinition.content += `\n\r[Pubsub Topics](https://console.cloud.google.com/cloudpubsub/topic/list?referrer=search&project=$project_id.value&pageState=(%22cpsTopicList%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22service-id_3A%2520${serviceId}_5C_22_22_2C_22s_22_3Atrue%257D%255D%22)))`;
    widgets[0].noteDefinition.content += `\n\r[Pubsub Subscriptions](https://console.cloud.google.com/cloudpubsub/subscription/list?referrer=search&project=$project_id.value&pageState=(%22cpsTopicList%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22service-id_3A%2520pixel_5C_22_22_2C_22s_22_3Atrue%257D%255D%22),%22cpsSubscriptionList%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22service-id_3A%2520${serviceId}_5C_22_22_2C_22s_22_3Atrue%257D%255D%22)))`;
  }
  if (monitoringState.pubsubPull.enabled) {
    widgets.push(...getDatadogWidgets('pubsubPull'));
  }
  if (monitoringState.pubsubPush.enabled) {
    widgets.push(...getDatadogWidgets('pubsubPush'));
  }
  if (monitoringState.redis.enabled) {
    widgets.push(...getDatadogWidgets('redis'));
  }
  if (monitoringState.bigtable.enabled) {
    widgets.push(...getDatadogWidgets('bigtable'));
  }
  if (monitoringState.storage.enabled) {
    widgets.push(...getDatadogWidgets('storage'));
  }
  if (monitoringState.sql.enabled) {
    widgets.push(...getDatadogWidgets('sql'));
  }
  if (monitoringState.cloudTasks.enabled) {
    widgets.push(...getDatadogWidgets('cloudTasks'));
  }
  widgets.push(...getDatadogWidgets('logging'));
  data.widgets = widgets;
  const dashboard = new datadog.Dashboard('datadog-default-dashboard', data, {
    provider: getDatadogProvider(),
  });

  return dashboard;
}

type Link = 'logs' | 'k8s' | 'apm' | 'temporal';

export function getLinks(
  linkTypes: Link[],
  opts: {
    webFramework?: string;
    useTemplateVariables?: boolean;
    forK8sNamespace?: string;
    defaultContainerNameFilter?: boolean;
  } = {}
) {
  const {
    webFramework,
    useTemplateVariables,
    forK8sNamespace,
    defaultContainerNameFilter = true,
  } = opts;
  const links = [];
  if (linkTypes.includes('logs')) {
    links.push(getLogsLink({ useTemplateVariables, forK8sNamespace, defaultContainerNameFilter }));
  }
  if (linkTypes.includes('k8s')) {
    links.push(getK8sLink({ useTemplateVariables, forK8sNamespace }));
  }
  if (linkTypes.includes('apm')) {
    links.push(getApmLink({ webFramework, useTemplateVariables }));
  }
  if (linkTypes.includes('temporal')) {
    links.push(getTemporalLink({ useTemplateVariables }));
  }
  return links;
}

export function getDatadogWidgets(
  type: DatadogResources,
  opts: {
    webFramework?: string;
    useTemplateVariables?: boolean;
    temporalServer?: boolean;
    forServiceId?: string;
    forK8sNamespace?: string;
  } = {},
  thisPos?: { x: number; y: number }
): Partial<DashboardWidget>[] {
  let {
    webFramework,
    useTemplateVariables = false,
    temporalServer = false,
    forServiceId,
    forK8sNamespace,
  } = opts;
  thisPos = thisPos || pos;

  const { serviceConfig } = getConfigs();
  if (!webFramework) {
    webFramework = getWebFramework(serviceConfig.runtime);
  }

  const {
    serviceId: sId,
    temporalNamespaceUnderscore,
    temporalNamespace,
    k8sNamespace: kNamespace,
  } = getFilterValues({ useTemplateVariables });
  const serviceId = forServiceId || sId;
  const k8sNamespace = forK8sNamespace || kNamespace;

  let filters: any = '';
  if (type === 'cloudTasks') {
    filters = monitoringState.cloudTasks.resourceNames.join(',');
  } else if (type === 'mongo') {
    filters = pulumi.all(monitoringState.mongo.resourceNames).apply((v) => (v as any).join(','));
  }
  const deployment = temporalServer ? 'kube_deployment' : 'triplewhale_com_deployment';
  const datadogWidgets: { [P in DatadogResources]?: Partial<DashboardWidget>[] } = {
    apmHttp: [
      {
        timeseriesDefinition: {
          title: 'RPS Per Path',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'default_zero(query1)', alias: 'Hits' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    query: `sum:trace.${webFramework}.request.hits{service:${serviceId},env:$project_id.value,$resource_name} by {resource_name}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
          markers: [],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'RPS By Response Code',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { formulaExpression: 'default_zero(query1)', alias: 'Hits' },
                {
                  alias: 'Proxy Errors',
                  style: { paletteIndex: 7, palette: 'warm' },
                  formulaExpression: 'default_zero(query2)',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    query: `sum:trace.${webFramework}.request.hits{service:${serviceId},env:$project_id.value,$resource_name} by {http.status_code}.as_rate()`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    query: `sum:gcp.logging.user.knative_queue_proxy_errors{target_key:${serviceId}-ns/*,$project_id}.as_rate().fill(zero)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
          markers: [],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Overall Request Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { formulaExpression: 'query1', alias: 'p50' },
                { formulaExpression: 'query2', alias: 'p90' },
                { formulaExpression: 'query3', alias: 'p95' },
                { formulaExpression: 'query4', alias: 'p99' },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `p50:trace.${webFramework}.request{service:${serviceId},env:$project_id.value,$resource_name}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    dataSource: 'metrics',
                    query: `p90:trace.${webFramework}.request{service:${serviceId},env:$project_id.value,$resource_name}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query3',
                    dataSource: 'metrics',
                    query: `p95:trace.${webFramework}.request{service:${serviceId},env:$project_id.value,$resource_name}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query4',
                    dataSource: 'metrics',
                    query: `p99:trace.${webFramework}.request{service:${serviceId},env:$project_id.value,$resource_name}`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 4, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'AVG Latency Per Path',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1', alias: 'latency' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:trace.${webFramework}.request{service:${serviceId},env:$project_id.value,$resource_name} by {resource_name}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 4, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: `Errors on service ${serviceId}`,
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:trace.${webFramework}.request.errors{service:${serviceId},env:$project_id.value,$resource_name} by {resource_name}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic' },
              displayType: 'bars',
            },
          ],
          markers: [],
        },
        widgetLayout: { x: 0, y: 2, width: 4, height: 3 },
      },
    ],
    saber: [
      {
        timeseriesDefinition: {
          title: 'Saber Transform Records',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:tw.saber.transform.records{service:${serviceId},$pipeline,env:$project_id.value} by {transform,pipeline}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Saber Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `avg:trace.saber.process{service:${serviceId}-saber,env:$project_id.value} by {resource_name}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Saber Errors',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: false,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:trace.saber.process.errors{env:$project_id.value,service:${serviceId}-saber} by {resource_name}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'bars',
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
    ],
    logging: [
      {
        timeseriesDefinition: {
          title: 'Logging throughput',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.logging.byte_count{$project_id AND namespace_name:${serviceId}-ns or pulumi-project:${serviceId}} by {log}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 4, y: 2, width: 4, height: 3 },
      },
    ],
    pubsub: [
      {
        timeseriesDefinition: {
          title: 'Pubsub Unacked Messages Age',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.pubsub.subscription.oldest_unacked_message_age{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 4, y: 2, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub Unacked Messages',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.num_unacked_messages_by_region{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 2, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub Dead Letter Messages',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.dead_letter_message_count{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
    ],
    pubsubPush: [
      {
        timeseriesDefinition: {
          title: 'Pubsub Push Request Latencies',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.push_request_latencies.avg{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.fill(null)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub Push Request Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.push_request_count{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {response_code}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
    ],
    pubsubPull: [
      {
        timeseriesDefinition: {
          title: 'Pubsub Ack Latencies',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.ack_latencies.avg{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.fill(null)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub expired ack deadlines count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.expired_ack_deadlines_count{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.fill(null)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub Sent Message Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.sent_message_count{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.fill(null)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pubsub Ack Message Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.pubsub.subscription.ack_message_count{service-id:${serviceId},$project_id,$subscription_id,resource_version:*} by {subscription_id}.fill(null)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
    ],
    bigtable: [
      {
        timeseriesDefinition: {
          title: 'Bigtable CPU Load',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'avg', formulaExpression: 'query1' },
                { alias: 'hottest', formulaExpression: 'query2' },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.bigtable.cluster.cpu_load{service-id:${serviceId},$project_id} by {cluster}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    dataSource: 'metrics',
                    query: `max:gcp.bigtable.cluster.cpu_load_hottest_node_high_granularity{service-id:${serviceId},$project_id} by {cluster}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 4, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Bigtable Request Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.bigtable.server.request_count{$project_id,service-id:${serviceId}} by {method}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Bigtable Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.bigtable.server.latencies.avg{$project_id,service-id:${serviceId}} by {method}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 21, width: 4, height: 3 },
      },
    ],
    redis: [
      {
        timeseriesDefinition: {
          title: 'Redis Commands',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.redis.commands.calls{service-id:${serviceId},$project_id} by {cmd}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
    ],
    k8s: [
      {
        timeseriesDefinition: {
          title: 'CPU Requests, Limits and Usage',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Cores used', formulaExpression: 'default_zero(query1)' },
                { alias: 'Cores limits', formulaExpression: 'default_zero(query2)' },
                { alias: 'Cores requests', formulaExpression: 'default_zero(query3)' },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.cpu.usage.total{kube_namespace:${k8sNamespace},$project_id,$deployment}.fill(null).rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.cpu.limits{kube_namespace:${k8sNamespace},$project_id,$deployment}.fill(null).rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query3',
                    query: `sum:kubernetes.cpu.requests{kube_namespace:${k8sNamespace},$project_id,$deployment}.fill(null).rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
        },
        widgetLayout: { x: 0, y: 6, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Instances',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ alias: 'Instances', formulaExpression: 'default_zero(query1)' }],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.pods.running{kube_namespace:${k8sNamespace},!pod_phase:pending,$project_id,$deployment} by {${deployment}}.fill(zero).rollup(max, 20)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
          // markers: maxReplicas.map((maxReplica) => ({
          //   value: `y = ${maxReplica.max}`,
          //   label: `Max ${maxReplica.name}`,
          //   displayType: 'info bold',
          // })),
        },
        widgetLayout: { x: 4, y: 6, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Network Rate',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Bytes received', formulaExpression: 'default_zero(query1)' },
                { alias: 'Bytes transmitted', formulaExpression: 'default_zero(query2)' },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.network.rx_bytes{kube_namespace:${k8sNamespace},$project_id,$deployment}.rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.network.tx_bytes{kube_namespace:${k8sNamespace},$project_id,$deployment}.rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
        },
        widgetLayout: { x: 8, y: 6, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Memory Requests, Limits and Usage',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Memory used', formulaExpression: 'default_zero(query1)' },
                { alias: 'Memory limits', formulaExpression: 'default_zero(query2)' },
                { alias: 'Memory requests', formulaExpression: 'default_zero(query3)' },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.memory.usage{kube_namespace:${k8sNamespace},$project_id,$deployment}.rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.memory.limits{kube_namespace:${k8sNamespace},$project_id,$deployment}.rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query3',
                    query: `sum:kubernetes.memory.requests{kube_namespace:${k8sNamespace},$project_id,$deployment}.rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
        },
        widgetLayout: { x: 4, y: 8, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'CPU Usage % (requests)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  alias: 'Usage',
                  formulaExpression:
                    '((default_zero(query1) / 1000 / 1000 / 1000) / default_zero(query2)) * 100',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.cpu.usage.total{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}.fill(null).rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.cpu.requests{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}.fill(null).rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
          markers: [{ value: 'y = 100', displayType: 'error bold' }],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Memory Usage % (requests)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  alias: 'Usage',
                  formulaExpression: '(default_zero(query1) / default_zero(query2)) * 100',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.memory.usage{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.memory.requests{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
          markers: [{ value: 'y = 100', displayType: 'error bold' }],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Pods',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Container restarts', formulaExpression: 'per_minute(query1)' },
                {
                  alias: 'crashloopbackoff',
                  formulaExpression: 'query2',
                  style: { palette: 'red' },
                },
                {
                  alias: 'Pod status',
                  formulaExpression: 'default_zero(query3)',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes_state.container.restarts{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.containers.state.waiting{kube_namespace:${k8sNamespace},reason:crashloopbackoff,$project_id,$deployment} by {${deployment}}`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query3',
                    query: `sum:kubernetes_state.pod.status_phase{!pod_phase:running,!pod_phase:succeeded,kube_namespace:${k8sNamespace},$project_id,$deployment} by {pod_phase,${deployment}}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
        },
        widgetLayout: { x: 0, y: 10, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'CPU Throttling',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ alias: 'CPU Throttling', formulaExpression: 'default_zero(query1)' }],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.cpu.cfs.throttled.seconds{kube_namespace:${k8sNamespace},$project_id,$deployment} by {${deployment}}.rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
        },
        widgetLayout: { x: 4, y: 10, width: 4, height: 3 },
      },
    ],
    sql: [
      {
        timeseriesDefinition: {
          title: 'Cloud SQL CPU Utilization',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? `avg:gcp.cloudsql.database.cpu.utilization{$project_id,pulumi-project:sensory}`
                      : `avg:gcp.cloudsql.database.cpu.utilization{$project_id,pulumi-project:${serviceId}} by {database_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 8, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Cloud SQL Memory Utilization',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? `avg:gcp.cloudsql.database.memory.utilization{$project_id,pulumi-project:sensory}`
                      : `avg:gcp.cloudsql.database.memory.utilization{$project_id,pulumi-project:${serviceId}} by {database_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 10, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Cloud SQL Memory Free',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? `avg:gcp.cloudsql.database.memory.components{$project_id,pulumi-project:sensory,component:free}`
                      : `avg:gcp.cloudsql.database.memory.components{$project_id,pulumi-project:${serviceId},component:free} by {database_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 10, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Cloud SQL Rows Processed',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? `sum:gcp.cloudsql.database.postgresql.tuples_processed_count{$project_id,pulumi-project:sensory}`
                      : `sum:gcp.cloudsql.database.postgresql.tuples_processed_count{$project_id,pulumi-project:${serviceId}} by {database_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 4, y: 10, width: 4, height: 3 },
      },
    ],
    cloudTasks: [
      {
        timeseriesDefinition: {
          title: 'Cloud Tasks Queue Depth',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.cloudtasks.queue.depth{$project_id AND queue_id IN (${filters})} by {queue_id}`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 8, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Cloud Tasks Attempt Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.cloudtasks.queue.task_attempt_count{$project_id AND queue_id IN (${filters})} by {response_code,queue_id}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 10, width: 4, height: 3 },
      },
    ],
    storage: [
      {
        timeseriesDefinition: {
          title: 'Storage API Request Count',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.storage.api.request_count{$project_id,service-id:${serviceId}} by {method}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 18, width: 4, height: 3 },
      },
    ],
    cloudRun: [
      {
        timeseriesDefinition: {
          title: 'RPS By Response Code (Cloud Run)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.run.request_count{$project_id,service-id:${serviceId}} by {response_code}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 4, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Overall Request Latency (Cloud Run)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Avg', formulaExpression: 'query1' },
                { alias: 'p95', formulaExpression: 'query2' },
                { alias: 'p99', formulaExpression: 'query3' },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.request_latencies.avg{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    dataSource: 'metrics',
                    query: `max:gcp.run.request_latencies.p95{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query3',
                    dataSource: 'metrics',
                    query: `max:gcp.run.request_latencies.p99{$project_id,service-id:${serviceId}}`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 8, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Instances (Cloud Run)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `sum:gcp.run.container.instance_count{$project_id,service-id:${serviceId}} by {state}.weighted()`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 0, y: 3, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'CPU utilization (Cloud Run)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Avg', formulaExpression: 'query1' },
                { alias: 'p95', formulaExpression: 'query2' },
                { alias: 'p99', formulaExpression: 'query3' },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.cpu.utilizations.avg{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.cpu.utilizations.p95{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query3',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.cpu.utilizations.p99{$project_id,service-id:${serviceId}}`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 4, y: 3, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Memory utilization (Cloud Run)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                { alias: 'Avg', formulaExpression: 'query1' },
                { alias: 'p95', formulaExpression: 'query2' },
                { alias: 'p99', formulaExpression: 'query3' },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.memory.utilizations.avg{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query2',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.memory.utilizations.p95{$project_id,service-id:${serviceId}}`,
                  },
                },
                {
                  metricQuery: {
                    name: 'query3',
                    dataSource: 'metrics',
                    query: `avg:gcp.run.container.memory.utilizations.p99{$project_id,service-id:${serviceId}}`,
                  },
                },
              ],
              style: { palette: 'dog_classic', lineType: 'solid', lineWidth: 'normal' },
              displayType: 'line',
            },
          ],
        },
        widgetLayout: { x: 8, y: 3, width: 4, height: 3 },
      },
    ],
    chronos: [
      {
        queryTableDefinition: {
          title: 'Pipeline Status',
          titleSize: '16',
          titleAlign: 'left',
          requests: [
            {
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'success',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:success} by {pipeline}.as_count()',
                    aggregator: 'sum',
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'failure',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:failure} by {pipeline}.as_count()',
                    aggregator: 'sum',
                  },
                },
              ],
              formulas: [
                {
                  cellDisplayMode: 'bar',
                  alias: 'success',
                  formulaExpression: 'success',
                  limit: { count: 500, order: 'desc' },
                },
                { cellDisplayMode: 'bar', alias: 'failure', formulaExpression: 'failure' },
              ],
            },
          ],
          hasSearchBar: 'auto',
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Success - Workflow Executions',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ style: { palette: 'classic' }, formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:success,$project_id,$stack,$label} by {pipeline}',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Failure - Workflow Executions',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ style: { palette: 'classic' }, formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:failure,$project_id,$stack,$label} by {pipeline}',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Skip - Workflow Executions',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ style: { palette: 'classic' }, formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:skip,$project_id,$stack,$label} by {pipeline}',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Force Complete - Workflow Executions',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ style: { palette: 'classic' }, formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'sum:custom.chronos.workflow.jobs{status:force_complete,$project_id,$stack,$label} by {pipeline}',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3, isColumnBreak: false },
      },
    ],
    temporal: [
      {
        timeseriesDefinition: {
          title: 'Temporal Workflow Execution Succeeded',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'query1',
                  alias: 'successful workflows',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.workflow.success.count{$project_id} by {namespace}.as_rate()'
                      : `sum:temporal.server.workflow.success.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Workflow Percent Failed',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  alias: 'failed %',
                  formulaExpression: '100 * fail / (success + fail)',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'success',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.workflow.success.count{$project_id} by {namespace}.as_rate().rollup(sum, 3600)'
                      : `sum:temporal.server.workflow.success.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_rate().rollup(sum,3600)`,
                  },
                },
                {
                  metricQuery: {
                    name: 'fail',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.workflow.failed.count{$project_id} by {namespace}.as_rate().rollup(sum, 3600)'
                      : `sum:temporal.server.workflow.failed.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_rate().rollup(sum,3600)`,
                  },
                },
              ],
              style: { palette: 'red', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Activity Execution Failed',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:trace.temporal.activity.errors{$project_id} by {service}.as_rate()'
                      : `sum:trace.temporal.activity.errors{$project_id, service:${serviceId}} by {resource_name}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'red', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
    ],
    temporalDetailed: [
      {
        timeseriesDefinition: {
          title: 'Temporal Workflow Execution Failed',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.workflow.failed.count{$project_id} by {namespace}.as_rate()'
                      : `sum:temporal.server.workflow.failed.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_rate()`,
                  },
                },
              ],
              style: { palette: 'red', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Sensory - Temporal Distinct Failed Integration IDs (per hour)',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  formulaExpression: 'count_not_null(query1)',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:custom.sensory.workflow.complete{success:false,$project_id} by {namespace}.as_count().rollup(sum, 3600)'
                      : `sum:custom.sensory.workflow.complete{success:false,$project_id,namespace:${temporalNamespace}} by {integrationid}.as_count().rollup(sum, 3600)`,
                  },
                },
              ],
              style: { palette: 'red', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        queryTableDefinition: {
          title: 'Sensory - Failing Integrations',
          titleSize: '16',
          titleAlign: 'left',
          requests: [
            {
              formulas: [
                {
                  alias: 'failure count',
                  cellDisplayMode: 'bar',
                  formulaExpression: 'query1',
                  limit: { count: 10000, order: 'desc' },
                  conditionalFormats: [{ comparator: '>=', palette: 'red_on_white', value: 0 }],
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:custom.sensory.workflow.complete{$project_id, success:false} by {namespace}.as_count()'
                      : `sum:custom.sensory.workflow.complete{$project_id, namespace:${temporalNamespace}, success:false} by {integrationid}.as_count()`,
                    aggregator: 'sum',
                  },
                },
              ],
            },
          ],
          hasSearchBar: 'auto',
        },
        widgetLayout: { x: 0, y: 21, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Workflow Execution Terminated',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'query1' }],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.workflow.terminate.count{$project_id} by {namespace}.as_count()'
                      : `sum:temporal.server.workflow.terminate.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_count()`,
                  },
                },
              ],
              style: { palette: 'red', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Activity End To End Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [{ formulaExpression: 'sum / count' }],
              queries: [
                {
                  metricQuery: {
                    name: 'sum',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'avg:temporal.server.activity.end_to_end_latency.sum{$project_id} by {namespace}.as_count()'
                      : `avg:temporal.server.activity.end_to_end_latency.sum{$project_id,namespace:${temporalNamespaceUnderscore}} by {activitytype}.as_count()`,
                  },
                },
                {
                  metricQuery: {
                    name: 'count',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'avg:temporal.server.activity.end_to_end_latency.count{$project_id} by {namespace}.as_count()'
                      : `avg:temporal.server.activity.end_to_end_latency.count{$project_id,namespace:${temporalNamespaceUnderscore}} by {activitytype}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Schedule to Start Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic', paletteIndex: 2 },
                  formulaExpression: 'sum / count',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'sum',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'avg:temporal.server.task.schedule_to_start_latency.sum{$project_id} by {namespace}.as_count()'
                      : `avg:temporal.server.task.schedule_to_start_latency.sum{$project_id,namespace:${temporalNamespaceUnderscore}} by {task_type}.as_count()`,
                  },
                },
                {
                  metricQuery: {
                    name: 'count',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'avg:temporal.server.task.schedule_to_start_latency.count{$project_id} by {namespace}.as_count()'
                      : `avg:temporal.server.task.schedule_to_start_latency.count{$project_id,namespace:${temporalNamespaceUnderscore}} by {task_type}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Poller Timeouts Per Second',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic', paletteIndex: 2 },
                  formulaExpression: 'per_second(query1)',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query: temporalServer
                      ? 'sum:temporal.server.poll.timeouts.count{$project_id} by {namespace}.as_count()'
                      : `sum:temporal.server.poll.timeouts.count{$project_id,namespace:${temporalNamespaceUnderscore}}.as_count()`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3 },
      },
    ],
    temporalServer: [
      {
        timeseriesDefinition: {
          title: 'Temporal Server Errors',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'query1',
                  alias: 'server errors',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'sum:temporal.server.service.error_with_type.count{$project_id, !error_type:serviceerror_stickyworkerunavailable} by {service_name}.as_rate()',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal shard lock latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'sum / count',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'sum',
                    dataSource: 'metrics',
                    query:
                      'avg:temporal.server.lock.latency.sum{$project_id} by {operation}.as_count()',
                  },
                },
                {
                  metricQuery: {
                    name: 'count',
                    dataSource: 'metrics',
                    query:
                      'avg:temporal.server.lock.latency.count{$project_id} by {operation}.as_count()',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal persistence errors',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'query1',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'per_second(sum:temporal.server.persistence.error_with_type.count{$project_id} by {error_type,service_name}.as_count())',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Cache Latency',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'sum / count',
                  alias: 'cache latency',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'sum',
                    dataSource: 'metrics',
                    query:
                      'sum:temporal.server.cache.latency.sum{$project_id, operation:historycachegetorcreate}.as_count()',
                  },
                },
                {
                  metricQuery: {
                    name: 'count',
                    dataSource: 'metrics',
                    query:
                      'sum:temporal.server.cache.latency.count{$project_id, operation:historycachegetorcreate}.as_count()',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'Temporal Cache Miss',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'auto',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  style: { palette: 'classic' },
                  formulaExpression: 'query1',
                  alias: 'cache miss',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    name: 'query1',
                    dataSource: 'metrics',
                    query:
                      'temporal.server.cache.miss.count{$project_id, operation:historycachegetorcreate}.as_rate()',
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
        },
        widgetLayout: { x: 8, y: 4, width: 4, height: 3, isColumnBreak: false },
      },
      {
        timeseriesDefinition: {
          title: 'CPU Usage % (requests) by pod',
          titleSize: '16',
          titleAlign: 'left',
          showLegend: true,
          legendLayout: 'horizontal',
          legendColumns: ['avg', 'min', 'max', 'value', 'sum'],
          requests: [
            {
              formulas: [
                {
                  alias: 'Usage',
                  formulaExpression:
                    '((default_zero(query1) / 1000 / 1000 / 1000) / default_zero(query2)) * 100',
                },
              ],
              queries: [
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query1',
                    query: `sum:kubernetes.cpu.usage.total{kube_namespace:temporal,$project_id,$deployment} by {pod_name}.fill(null).rollup(avg, 20)`,
                  },
                },
                {
                  metricQuery: {
                    dataSource: 'metrics',
                    name: 'query2',
                    query: `sum:kubernetes.cpu.requests{kube_namespace:temporal,$project_id,$deployment} by {pod_name}.fill(null).rollup(avg, 20)`,
                  },
                },
              ],
              style: { palette: 'semantic', lineType: 'solid', lineWidth: 'normal' },
            },
          ],
          yaxis: { scale: 'linear', label: '', includeZero: true, min: 'auto', max: 'auto' },
          markers: [{ value: 'y = 100', displayType: 'error bold' }],
        },
        widgetLayout: { x: 0, y: 0, width: 4, height: 3 },
      },
    ],
  };
  return datadogWidgets[type]?.map((w) => setPos(thisPos, w)) || [];
}

function getWebFramework(runtime: string) {
  return { python: 'fastapi', node: 'express' }[runtime];
}

function getTemporalNamespace() {
  const { serviceId } = getConfigs();
  return `${serviceId}-ns`;
}

type Filters = {
  serviceId: string;
  temporalNamespaceUnderscore: string;
  temporalNamespace: string;
  k8sNamespace: string;
};

function getFilterValues(args: { useTemplateVariables?: boolean } = {}): Filters {
  const { useTemplateVariables = false } = args;
  if (useTemplateVariables) {
    return {
      serviceId: '$service_id.value',
      temporalNamespaceUnderscore: '$temporal_namespace_underscore.value',
      temporalNamespace: '$temporal_namespace.value',
      k8sNamespace: '$k8s_namespace.value',
    };
  }
  const { serviceId } = getConfigs();
  const temporalNamespace = getTemporalNamespace();
  return {
    serviceId,
    k8sNamespace: `${serviceId}-ns`,
    temporalNamespace,
    temporalNamespaceUnderscore: temporalNamespace.replaceAll('-', '_'),
  };
}

function getLogsLink(
  args: {
    useTemplateVariables?: boolean;
    forK8sNamespace?: string;
    defaultContainerNameFilter?: boolean;
  } = {}
) {
  const { useTemplateVariables = false, forK8sNamespace, defaultContainerNameFilter = true } = args;
  const k8sNamespace = forK8sNamespace || getFilterValues({ useTemplateVariables }).k8sNamespace;
  return `[Runtime Logs](https://console.cloud.google.com/logs/query;query=resource.type%3D%22k8s_container%22%0Aresource.labels.project_id%3D"$project_id.value"%0Aresource.labels.namespace_name="${k8sNamespace}"${
    defaultContainerNameFilter ? '%0Aresource.labels.container_name%3D%22default%22' : ''
  };duration=PT1H?project=$project_id.value)`;
}

function getK8sLink(args: { useTemplateVariables?: boolean; forK8sNamespace?: string } = {}) {
  const { useTemplateVariables = false, forK8sNamespace } = args;
  if (useTemplateVariables) {
    return `[k8s](https://api.triplewhale.com/devops/redirect/k8s?project-id=$project_id.value&k8s-namespace=$k8s_namespace.value)`;
  }
  const k8sNamespace = forK8sNamespace || getFilterValues({ useTemplateVariables }).k8sNamespace;
  return `[k8s](https://console.cloud.google.com/kubernetes/workload/overview?project=$project_id.value&pageState=(%22workload_list_table%22:(%22f%22:%22%255B%257B_22k_22_3A_22Namespace_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22${k8sNamespace}_5C_22_22_2C_22s_22_3Atrue_2C_22i_22_3A_22metadata%252Fnamespace_22%257D%255D%22),%22savedViews%22:(%22i%22:%22fe282b320bfa4e989238fe1ac2640dea%22,%22c%22:%5B%5D,%22n%22:%5B%5D)))`;
}

function getApmLink(args: { useTemplateVariables?: boolean; webFramework?: string } = {}) {
  let { useTemplateVariables = false, webFramework } = args;
  if (!webFramework) {
    const { serviceConfig } = getConfigs();
    webFramework = getWebFramework(serviceConfig.runtime);
  }
  if (useTemplateVariables) {
    return `[APM](https://api.triplewhale.com/devops/redirect/apm?project-id=$project_id.value&service-id=$service_id.value&web-framework=${webFramework})`;
  }
  const { serviceId } = getFilterValues({ useTemplateVariables });
  return `[APM](https://us5.datadoghq.com/apm/services/${serviceId}/operations/${webFramework}.request/resources?env=$project_id.value)`;
}

function getTemporalLink(args: { useTemplateVariables?: boolean } = {}) {
  const { useTemplateVariables = false } = args;
  let url = '';
  if (useTemplateVariables) {
    url = `[Temporal](https://api.triplewhale.com/devops/redirect/temporal?project-id=$project_id.value&temporal-namespace=$temporal_namespace.value)`;
  } else {
    url = `[Temporal](http://$project_id.value\\.temporal-ui-web.iap.triplestack.io/namespaces/${getTemporalNamespace()}/workflows)`;
  }
  return url;
}
