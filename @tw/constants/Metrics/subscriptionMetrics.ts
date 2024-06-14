import { MetricsDictionary } from '@tw/types/module/metrics/metrics';
import { divide, sum } from './utils';

export const subscriptionMetrics: MetricsDictionary = {
  subscriptionSignUps: {
    key: 'subscriptionSignUps',
    label: 'Subscription Sign Ups',
    shortLabel: 'Sign Ups',
    type: 'ads',
    showInPixelByDefault: false,
    icon: 'recharge',
    format: 'decimal',
    toFixed: 1,
    minimumFractionDigits: 0,
    dependOnActiveIntegrations: ['recharge'],
    allowOrderBy: true,
    pixelIndex: 4,
    calculateSum: (items) => {
      return sum(items, 'subscriptionSignUps');
    },
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInCreativeByDefault: false,
  },
  subscriptionSignUpsRate: {
    key: 'subscriptionSignUpsRate',
    label: 'Subscription Sign Up Rate',
    shortLabel: 'Sign Up Rate',
    format: 'percent',
    toFixed: 2,
    minimumFractionDigits: 0,
    type: 'ads',
    dependOnActiveIntegrations: ['recharge'],
    icon: 'recharge',
    showInPixelByDefault: false,
    showInReport: true,
    allowOrderBy: true,
    pixelIndex: 4,
    calculateSum: (items) => {
      return divide(items, 'subscriptionSignUps', 'pixelVisitors');
    },
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInCreativeByDefault: false,
  },
  subscriptionChurns: {
    key: 'subscriptionChurns',
    label: 'Subscription Churns',
    shortLabel: 'Churns',
    format: 'decimal',
    toFixed: 0,
    dependOnActiveIntegrations: ['recharge'],
    type: 'ads',
    icon: 'recharge',
    showInPixelByDefault: false,
    showInReport: false,
    allowOrderBy: true,
    pixelIndex: 4,
    calculateSum: (items) => {
      return sum(items, 'subscriptionChurns');
    },
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInCreativeByDefault: false,
  },
  subscriptionChurnsRate: {
    key: 'subscriptionChurnsRate',
    label: 'Subscription Churn Rate',
    shortLabel: 'Churn Rate',
    format: 'percent',
    toFixed: 2,
    minimumFractionDigits: 0,
    icon: 'recharge',
    dependOnActiveIntegrations: ['recharge'],
    type: 'ads',
    showInPixelByDefault: false,
    showInReport: false,
    allowOrderBy: true,
    pixelIndex: 4,
    calculateSum: (items) => {
      return divide(items, 'subscriptionChurns', 'pixelVisitors');
    },
    showInCreativeCard: [],
    showInCreativeTable: [],
    showInCreativeByDefault: false,
  },
};
