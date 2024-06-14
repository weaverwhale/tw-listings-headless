import * as gcp from '@pulumi/gcp';
import * as datadog from '@pulumi/datadog';
import * as pulumi from '@pulumi/pulumi';
import { monitoringState } from '../monitoring/state';
import { getSlackUserByEmail } from '../slack';
import { createLabels, getConfigs } from '../utils';
import { getDatadogProvider } from './provider';
import { DatadogResources } from './types';
import { getAlertEmails } from '../monitoring';
import { getDeployments } from '../service/serviceEntry';
import { appendToOutput } from '../pulumi-utils/append';

export function createDatadogMonitorMessage(
  args: {
    datadogDashboard?: datadog.Dashboard;
    sendOnAlert?: boolean;
    sendOnWarning?: boolean;
    contacts?: string[];
    slackChannelError?: string;
    slackChannelWarning?: string;
    includeOpsGenie?: boolean;
  } = {}
) {
  const {
    sendOnAlert = true,
    sendOnWarning = true,
    datadogDashboard,
    contacts,
    slackChannelError = 'slack-datadog-alerts',
    slackChannelWarning = 'slack-datadog-warning',
    includeOpsGenie = true,
  } = args;
  const slackTagsOutputs = contacts.map(
    (email: string) => pulumi.interpolate`<@${getSlackUserByEmail(email).id}>`
  );
  const slackTags = pulumi.all(slackTagsOutputs).apply((emails) => (emails as any).join(' '));
  let defaultMessage = pulumi.output('');
  if (datadogDashboard) {
    defaultMessage = appendToOutput(
      defaultMessage,
      pulumi.interpolate`Dashboard: https://us5.datadoghq.com${datadogDashboard.url}`
    );
  }
  defaultMessage = appendToOutput(defaultMessage, 'Notify');
  if (sendOnAlert) {
    defaultMessage = appendToOutput(
      defaultMessage,
      `{{#is_alert}}@${slackChannelError} ${
        includeOpsGenie ? '@opsgenie' : ''
      }{{/is_alert}} {{#is_alert_recovery}}${
        includeOpsGenie ? '@opsgenie' : ''
      }{{/is_alert_recovery}}`
    );
  }
  if (sendOnWarning) {
    defaultMessage = appendToOutput(
      defaultMessage,
      `{{#is_warning}}@${slackChannelWarning}{{/is_warning}}`
    );
  }
  if (contacts) {
    defaultMessage = appendToOutput(
      defaultMessage,
      pulumi.interpolate`${contacts.map((v) => `@${v}`).join(' ')} \n ${slackTags}`
    );
  }
  return defaultMessage;
}

export function getDatadogMonitorDefaultSettings() {
  return {
    requireFullWindow: true,
    notifyNoData: false,
    renotifyInterval: 0,
    includeTags: true,
    newGroupDelay: 60,
    notificationPresetName: 'hide_handles',
    tags: createLabels(true),
  };
}

export function createDefaultDatadogMonitors(args: {
  datadogDashboard: datadog.Dashboard;
  excludePubsubSubs: gcp.pubsub.Subscription[];
}) {
  const { datadogDashboard } = args;
  const contacts = getAlertEmails();

  const { serviceId, projectId } = getConfigs();
  const temporalNamespace = `${serviceId}-ns`.replaceAll('-', '_');

  const monitors: (datadog.MonitorArgs & {
    _id: string;
  })[] = [];
  const openDeployments = Object.values(getDeployments('k8s')).filter((d) => d.endpoints.open);
  const defaultSettings = getDatadogMonitorDefaultSettings();
  const simpleMonitors: Record<string, datadog.Monitor> = {};

  if (monitoringState.k8s.enabled) {
    monitors.push(...getDatadogMonitor('k8s'));
  }
  if (monitoringState.apmHttp.enabled) {
    monitors.push(...getDatadogMonitor('apmHttp'));
  }
  if (monitoringState.pubsub.enabled) {
    monitors.push(...getDatadogMonitor('pubsub'));
  }
  if (monitoringState.cloudTasks.enabled) {
    monitors.push(...getDatadogMonitor('cloudTasks'));
  }
  if (monitoringState.sql.enabled) {
    monitors.push(...getDatadogMonitor('sql'));
  }
  if (monitoringState.redis.enabled) {
    monitors.push(...getDatadogMonitor('redis'));
  }
  if (monitoringState.temporal.enabled) {
    monitors.push(...getDatadogMonitor('temporal'));
  }
  monitors.push(...getDatadogMonitor('logging'));
  if (openDeployments?.length) {
    for (const deployment of openDeployments) {
      createDatadogUptimeCheck({
        name: deployment.name,
        // @ts-ignore
        url: deployment.endpoints.open.url,
        message: createDatadogMonitorMessage({ datadogDashboard, contacts }),
      });
    }
  }
  for (const monitor of monitors) {
    const id = monitor._id;
    delete monitor._id;
    // @ts-ignore
    monitor.tags = [...monitor.tags, `monitor-type:${id}`];
    simpleMonitors[id] = new datadog.Monitor(id, monitor, { provider: getDatadogProvider() });
  }

  createCompositeMonitors(simpleMonitors);
  function getDatadogMonitor(type: DatadogResources) {
    const defaultMessage = createDatadogMonitorMessage({ datadogDashboard, contacts });
    const monitors: { [P in DatadogResources]?: (datadog.MonitorArgs & { _id: string })[] } = {
      pubsub: [
        {
          _id: 'pubsub-oldest-unacked',
          message: defaultMessage,
          name: `<${serviceId}> Oldest Unacked message is high for {{subscription_id.name}}`,
          monitorThresholds: {
            critical: '2800',
            warning: '1800',
          },
          type: 'query alert',
          query: `avg(last_1h):avg:gcp.pubsub.subscription.oldest_unacked_message_age{service-id:${serviceId},project_id:${projectId}} by {subscription_id} > 2800`,
          evaluationDelay: 300,
          ...defaultSettings,
        },
      ],
      apmHttp: [
        {
          name: `<${serviceId}> Error Rate is high for {{resource_name.name}}`,
          _id: 'apm-error-rate',
          type: 'query alert',
          query: `avg(last_5m):default_zero(sum:trace.express.request.errors{service:${serviceId},env:${projectId}} by {resource_name}.as_rate() / sum:trace.express.request.hits{service:${serviceId},env:${projectId}} by {resource_name}.as_rate() * 100) > 10`,
          message: createDatadogMonitorMessage({ sendOnAlert: false, datadogDashboard, contacts }),
          monitorThresholds: {
            critical: '10',
            warning: '7',
          },
          ...defaultSettings,
        },
        {
          name: `<${serviceId}> Number of errors has gone above {{value}} for {{resource_name.name}}`,
          _id: 'apm-error-count',
          type: 'query alert',
          query: `avg(last_5m):default_zero(sum:trace.express.request.errors{service:${serviceId},env:${projectId}} by {resource_name}.as_rate()) > 5`,
          message: createDatadogMonitorMessage({
            sendOnAlert: false,
            sendOnWarning: false,
            datadogDashboard,
            contacts,
          }),
          monitorThresholds: {
            critical: '5',
          },
          ...defaultSettings,
        },
        {
          name: `<${serviceId}> Spike in request errors on {{resource_name.name}}`,
          _id: 'apm-error-spike',
          type: 'query alert',
          query: `change(avg(last_5m),last_5m):100 * sum:trace.express.request.errors{service:${serviceId},env:${projectId}} by {resource_name}.as_rate() / sum:trace.express.request.hits{service:${serviceId},env:${projectId}} by {resource_name}.as_rate() > 1`,
          monitorThresholds: {
            critical: '1',
          },
          message: createDatadogMonitorMessage({
            sendOnAlert: false,
            sendOnWarning: false,
            datadogDashboard,
            contacts,
          }),
          ...defaultSettings,
        },
        {
          name: `<${serviceId}> Service has a faulty deployment | {{event.title}}`,
          _id: 'apm-faulty-deployment',
          type: 'event-v2 alert',
          query: `events("tags:deployment_analysis tags:\"env:${projectId}\" tags:\"service:${serviceId}\"\").rollup(\"count\").by(\"version\").last(\"70m\") > 0`,
          monitorThresholds: {
            critical: '0',
          },
          message: pulumi.interpolate`{{event.text}} ${defaultMessage}`,
          ...defaultSettings,
        },
      ],
      cloudTasks: [
        {
          name: `<${serviceId}> Cloud Tasks queue depth is high for {{queue_id.name}}`,
          _id: 'cloud-tasks-queue-depth',
          type: 'query alert',
          query: `avg(last_1h):sum:gcp.cloudtasks.queue.depth{project_id:${projectId} AND queue_id IN (${monitoringState.cloudTasks.resourceNames.join(
            ','
          )})} by {queue_id} > 20000`,
          evaluationDelay: 300,
          message: defaultMessage,
          ...defaultSettings,
        },
      ],
      k8s: [
        {
          name: `<${serviceId}> Container restarts are high for {{triplewhale_com_deployment.name}}`,
          _id: 'k8s-container-restarts',
          type: 'query alert',
          query: `avg(last_10m):per_minute(sum:kubernetes_state.container.restarts{project_id:${projectId},kube_namespace:${serviceId}-ns} by {triplewhale_com_deployment}) > 10`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '10',
            warning: '3',
          },
          ...defaultSettings,
        },
        {
          name: `<${serviceId}> K8s CrashLoopBackOff {{triplewhale_com_deployment.name}}`,
          _id: 'k8s-crashloopbackoff',
          type: 'query alert',
          query: `avg(last_5m):avg:kubernetes.containers.state.waiting{project_id:${projectId},kube_namespace:${serviceId}-ns,reason:crashloopbackoff} by {triplewhale_com_deployment} >= 1`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '1',
          },
          ...defaultSettings,
        },
      ],
      sql: [
        {
          name: `<${serviceId}> SQL CPU utilization is high for {{database_id.name}}`,
          _id: 'sql-cpu-utilization',
          type: 'query alert',
          query: `avg(last_1h):avg:gcp.cloudsql.database.cpu.utilization{service-id:${serviceId},project_id:${projectId}} by {database_id} > 0.65`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '0.65',
            warning: '0.5',
          },
          evaluationDelay: 300,
          ...defaultSettings,
        },
        {
          name: `<${serviceId}> SQL Memory utilization is high for {{database_id.name}}`,
          _id: 'sql-memory-utilization',
          type: 'query alert',
          query: `avg(last_1h):avg:gcp.cloudsql.database.memory.utilization{service-id:${serviceId},project_id:${projectId}} by {database_id} > 0.70`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '0.70',
            warning: '0.55',
          },
          evaluationDelay: 300,
          ...defaultSettings,
        },
      ],
      redis: [
        {
          name: `<${serviceId}> Redis Memory utilization is high for {{instance_id.name}}`,
          _id: 'redis-memory-utilization',
          type: 'query alert',
          query: `avg(last_1h):avg:gcp.redis.stats.memory.usage_ratio{service-id:${serviceId},project_id:${projectId}} by {instance_id} > 0.85`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '0.85',
            warning: '0.75',
          },
          evaluationDelay: 300,
          ...defaultSettings,
        },
      ],
      logging: [
        {
          name: `<${serviceId}> Logging Throughput is high for {{log.name}} in project {{project_id.name}}`,
          _id: 'logging-throughput',
          type: 'query alert',
          query: `avg(last_1h):sum:gcp.logging.byte_count{namespace_name:${serviceId}-ns} by {log,project_id}.as_rate() > 2000000`, // 2MB
          message: createDatadogMonitorMessage({
            datadogDashboard,
            contacts,
            slackChannelError: 'slack-datadog-warning',
            includeOpsGenie: false,
          }),
          monitorThresholds: {
            critical: '2000000',
            warning: '1500000',
          },
          evaluationDelay: 300,
          ...defaultSettings,
        },
      ],
      temporal: [
        {
          name: `<${serviceId}> Temporal Workflow Execution Failure Rate is High`,
          _id: 'temporal-workflow-execution-failure-rate',
          type: 'query alert',
          query: `avg(last_2h):100*sum:temporal.server.workflow.failed.count{project_id:${projectId},namespace:${temporalNamespace}}.as_rate().rollup(sum, 3600) / (sum:temporal.server.workflow.success.count{project_id:${projectId},namespace:${temporalNamespace}}.as_rate().rollup(sum, 3600) + sum:temporal.server.workflow.failed.count{project_id:${projectId},namespace:${temporalNamespace}}.as_rate().rollup(sum, 3600)) > 10`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '10',
            warning: '5',
          },
          evaluationDelay: 300,
          ...defaultSettings,
          newGroupDelay: null,
        },
        {
          name: `<${serviceId}> Drop in temporal workflow execution successes`,
          _id: 'temporal-workflow-execution-success-rate',
          type: 'query alert',
          query: `pct_change(avg(last_1h), last_1h): sum:temporal.server.workflow.success.count{project_id:${projectId},namespace:${temporalNamespace}}.rollup(sum, 3600) < -50`,
          message: defaultMessage,
          monitorThresholds: {
            critical: '-50',
          },
          evaluationDelay: 3600,
          ...defaultSettings,
          newGroupDelay: null,
        },
      ],
    };
    return monitors[type];
  }

  function createCompositeMonitors(simpleMonitors: Record<string, datadog.Monitor> = {}) {
    const defaultMessage = createDatadogMonitorMessage({ datadogDashboard, contacts });
    const compositeMonitors: { _id: string; ids: string[]; monitor: datadog.MonitorArgs }[] = [
      {
        _id: 'apm-error-high',
        ids: ['apm-error-rate', 'apm-error-count'],
        monitor: {
          ...defaultSettings,
          name: `<${serviceId}> Errors is high for {{resource_name.name}}`,
          type: 'composite',
          query: ``,
          message: defaultMessage,
          newGroupDelay: null,
        },
      },
      {
        _id: 'apm-error-high-spike',
        ids: ['apm-error-spike', 'apm-error-count'],
        monitor: {
          ...defaultSettings,
          name: `<${serviceId}> Error spike for {{resource_name.name}}`,
          type: 'composite',
          query: ``,
          message: defaultMessage,
          newGroupDelay: null,
        },
      },
    ];
    for (const compositeMonitor of compositeMonitors) {
      const relevantMonitors = compositeMonitor.ids.map((id) => simpleMonitors[id]).filter(Boolean);
      if (relevantMonitors.length === compositeMonitor.ids.length) {
        compositeMonitor.monitor.query = pulumi.all(relevantMonitors).apply((m) => {
          return pulumi.interpolate`${m[0].id} && ${m[1].id}`;
        });
        new datadog.Monitor(compositeMonitor._id, compositeMonitor.monitor, {
          provider: getDatadogProvider(),
        });
      }
    }
  }
}

function createDatadogUptimeCheck(args: {
  name: string;
  url: pulumi.Output<string>;
  message: pulumi.Output<string>;
}) {
  const { name, url, message } = args;
  const endpoint = url.apply((url) => url + '/ping');
  const { serviceId } = getConfigs();
  const uptimeCheck = new datadog.SyntheticsTest(
    name,
    {
      assertions: [
        {
          operator: 'is',
          target: '200',
          type: 'statusCode',
        },
        {
          operator: 'lessThan',
          target: '1000',
          type: 'responseTime',
        },
        {
          operator: 'contains',
          target: serviceId,
          type: 'body',
        },
      ],
      locations: [
        'aws:us-east-2',
        'aws:us-west-1',
        'aws:eu-central-1',
        'aws:ap-northeast-1',
        'aws:ap-east-1',
        'aws:eu-west-2',
        'aws:ap-southeast-1',
      ],
      message,
      name: endpoint.apply((e) => `An Uptime test on ${e}`),
      optionsList: {
        monitorOptions: {
          renotifyInterval: 360,
        },
        retry: {
          count: 3,
          interval: 300,
        },
        minFailureDuration: 120,
        tickEvery: 60,
      },
      requestDefinition: {
        method: 'GET',
        url: endpoint,
      },
      tags: [`service-id:${serviceId}`],
      status: 'live',
      subtype: 'http',
      type: 'api',
    },
    { provider: getDatadogProvider() }
  );
  return uptimeCheck;
}

export async function createDatadogMonitor({
  id,
  contacts,
  datadogDashboard,
  sendOnAlert,
  sendOnWarning,
  settings,
  message,
  slackChannelError,
  slackChannelWarning,
  includeOpsGenie,
}: {
  id: string;
  contacts?: string[];
  datadogDashboard?: datadog.Dashboard;
  sendOnAlert?: boolean;
  sendOnWarning?: boolean;
  settings: Partial<datadog.MonitorArgs> & {
    name: datadog.MonitorArgs['name'];
    query: datadog.MonitorArgs['query'];
    type: datadog.MonitorArgs['type'];
  };
  message?: string | pulumi.Input<string>;
  slackChannelError?: string;
  slackChannelWarning?: string;
  includeOpsGenie?: boolean;
}) {
  contacts = contacts || getAlertEmails();
  message =
    settings.message ||
    pulumi.interpolate`${message ? message + ' ' : ''}${createDatadogMonitorMessage({
      datadogDashboard,
      contacts,
      sendOnAlert,
      sendOnWarning,
      slackChannelError,
      slackChannelWarning,
      includeOpsGenie,
    })}`;
  const defaultSettings = {
    requireFullWindow: true,
    notifyNoData: false,
    renotifyInterval: 0,
    includeTags: true,
    notificationPresetName: 'hide_handles',
    tags: createLabels(true),
    newGroupDelay: null,
    message,
  };
  return new datadog.Monitor(
    id,
    { ...defaultSettings, ...settings },
    { provider: getDatadogProvider() }
  );
}
