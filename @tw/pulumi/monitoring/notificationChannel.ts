import { isStaging, projectId } from '../constants';

export const slackNotificationChannels = {
  shofifi: {
    '#cloud-alerts': `projects/shofifi/notificationChannels/2880990531074248576`,
  },
  'triple-whale-staging': {
    '#cloud-alerts-stg': `projects/triple-whale-staging/notificationChannels/11720180862810124581`,
  },
};

const appNotificationChannels = {
  shofifi: {
    'chezki@triplewhale.com': 'projects/shofifi/notificationChannels/7786083633944694398',
  },
};

const pubsubNotificationChannels = {
  shofifi: {
    'cloud-notifications': `projects/shofifi/notificationChannels/8526773327200564276`,
  },
  'triple-whale-staging': {
    'cloud-notifications': `projects/triple-whale-staging/notificationChannels/4098065629908968534`,
  },
};

export const pubsubNotificationChannel =
  pubsubNotificationChannels[projectId]?.['cloud-notifications'];

export const defaultSlackChannelName = `#cloud-alerts${isStaging ? '-stg' : ''}`;
