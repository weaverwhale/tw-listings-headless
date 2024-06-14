import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';

import {
  defaultSlackChannelName,
  pubsubNotificationChannel,
  slackNotificationChannels,
} from './notificationChannel';
import { getSlackUserByEmail } from '../slack';
import { loadServiceConfig } from '../service';
import { getGcloudUserEmail } from '@tw/devops';

export type BaseAlertArgs = {
  name: string;
  sendEverySeconds?: number;
  autoCloseSeconds?: number;
  slack?: boolean;
  slackChannel?: string;
};

let alertEmails: string[] = null;

const operatorsMap = {
  GREATER_THAN: 'COMPARISON_GT',
  LESS_THAN: 'COMPARISON_LT',
  EQUAL: 'COMPARISON_EQ',
};

export function createLogBasedAlertWithThreshold(
  args: BaseAlertArgs & {
    conditions: string[];
    addNamespaceCondition?: boolean;
    alertPolicy: {
      duration?: string;
      operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUAL';
      threshold: number;
    };
    notificationChannels?: string[];
    displayName: string;
    alignmentPeriod?: string;
  }
) {
  const { serviceId, projectId } = getConfigs();
  const {
    conditions,
    alertPolicy,
    notificationChannels = [],
    name,
    autoCloseSeconds = 604800,
    slack = true,
    slackChannel = defaultSlackChannelName,
    displayName,
    addNamespaceCondition = true,
  } = args;
  const { duration = '0s', operator, threshold } = alertPolicy;

  addNamespaceCondition
    ? conditions.push(`resource.labels.namespace_name="${serviceId}-ns"`)
    : null;
  const filter = conditions.join(' ');

  const logsBasedMetric = new gcp.logging.Metric(`${name}-metric`, {
    name: `${name}-metric`,
    filter: filter,
    description: 'Metric based log',
  });

  const policy = new gcp.monitoring.AlertPolicy(name, {
    displayName: displayName,
    combiner: 'OR',
    conditions: [
      {
        displayName: `${serviceId}-log-based-alert-policy-condition`,
        conditionThreshold: {
          filter: pulumi.interpolate`
          metric.type="logging.googleapis.com/user/${logsBasedMetric.name}" AND resource.type="cloud_run_revision"`,
          aggregations: [
            {
              alignmentPeriod: '600s',
              crossSeriesReducer: 'REDUCE_SUM',
              perSeriesAligner: 'ALIGN_DELTA',
            },
          ],
          comparison: operatorsMap[operator],
          thresholdValue: threshold,
          trigger: {
            count: 1,
          },
          duration,
        },
      },
    ],
    documentation: tagMaintainersSlack() || undefined,
    notificationChannels: [
      pubsubNotificationChannel,
      ...(slack ? [slackNotificationChannels[projectId][slackChannel]] : []),
      ...notificationChannels,
    ],
    alertStrategy: {
      autoClose: `${autoCloseSeconds}s`,
    },
  });
  return policy;
}

export function createLogBasedAlert(
  args: BaseAlertArgs & { logSearch: string; displayName: string }
) {
  const { name, sendEverySeconds, autoCloseSeconds = 604800, logSearch, slack, displayName } = args;
  const conditions = [
    {
      displayName: 'Log match condition',
      conditionMatchedLog: {
        filter: logSearch,
      },
    },
  ];
  const alert = createAlert({
    name,
    sendEverySeconds,
    autoCloseSeconds,
    slack,
    conditions,
    isMetricBased: false,
    displayName,
  });
  return alert;
}

export function createAlert(
  args: BaseAlertArgs & {
    conditions: gcp.types.input.monitoring.AlertPolicyCondition[];
    combiner?: pulumi.Input<string>;
    enabled?: boolean;
    notificationChannels?: string[];
    isMetricBased?: boolean;
    displayName: string;
  }
) {
  const { projectId, serviceId } = getConfigs();
  const {
    name,
    sendEverySeconds = 3600,
    autoCloseSeconds = 604800,
    slack,
    slackChannel = defaultSlackChannelName,
    conditions,
    combiner = 'OR',
    enabled = true,
    notificationChannels = [],
    isMetricBased = true,
    displayName,
  } = args;

  const alert = new gcp.monitoring.AlertPolicy(name, {
    alertStrategy: {
      ...(!isMetricBased
        ? {
            notificationRateLimit: {
              period: `${sendEverySeconds}s`,
            },
          }
        : {}),
      autoClose: `${autoCloseSeconds}s`,
    },
    conditions,
    combiner,
    displayName,
    documentation: slack ? tagMaintainersSlack() : null,
    enabled,
    notificationChannels: [
      pubsubNotificationChannel,
      ...(slack ? [slackNotificationChannels[projectId][slackChannel]] : []),
      ...notificationChannels,
    ],
  });
  return alert;
}

function tagMaintainersSlack(): {
  content: pulumi.OutputInstance<string>;
  mimeType: string;
} {
  const contacts = getAlertEmails();
  if (!contacts.length) return null;
  const slackTagsOutputs = contacts.map(
    (email: string) => pulumi.interpolate`<@${getSlackUserByEmail(email).id}>`
  );
  const slackTags = pulumi.all(slackTagsOutputs).apply((emails) => (emails as any).join(' '));
  const documentation = {
    content: slackTags,
    mimeType: 'text/markdown',
  };
  return documentation;
}

export function getAlertEmails() {
  if (!alertEmails?.length) {
    const serviceConfig = loadServiceConfig();
    const contacts = (serviceConfig.maintainers || []).concat(serviceConfig.contacts || []);
    contacts.push(getAuthor());
    alertEmails = [...new Set(contacts.filter(Boolean))];
  }
  return alertEmails;
}

export function getAuthor() {
  if (process.env.AUTHOR) return process.env.AUTHOR;
  if (!process.env.IS_CLOUD_BUILD) {
    try {
      return getGcloudUserEmail();
    } catch {}
  }
}
