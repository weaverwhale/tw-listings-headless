export type DataTypesIds =
  | 'ads-metrics'
  | 'ads-settings'
  | 'assets-settings'
  | 'creatives-metrics'
  | 'videos-metrics'
  | 'orders'
  | 'inventory_items'
  | 'products'
  | 'prices'
  | 'subscriptions'
  | 'customers'
  | 'webhook'
  | 'refunds'
  | 'issues'
  | 'surveys'
  | 'payments'
  | 'product-fees'
  | 'listings-items'
  | 'balanceTransactions'
  | 'events'
  | 'contacts'
  | 'companies'
  | 'shipping'
  | 'conversations';

export type DataTypesMap = {
  [type in DataTypesIds]: type;
};

export const DataTypesRoles: DataTypesMap = {
  'ads-metrics': 'ads-metrics',
  issues: 'issues',
  'ads-settings': 'ads-settings',
  'assets-settings': 'assets-settings',
  'creatives-metrics': 'creatives-metrics',
  'videos-metrics': 'videos-metrics',
  inventory_items: 'inventory_items',
  orders: 'orders',
  products: 'products',
  prices: 'prices',
  customers: 'customers',
  subscriptions: 'subscriptions',
  webhook: 'webhook',
  refunds: 'refunds',
  surveys: 'surveys',
  payments: 'payments',
  'product-fees': 'product-fees',
  'listings-items': 'listings-items',
  balanceTransactions: 'balanceTransactions',
  events: 'events',
  contacts: 'contacts',
  companies: 'companies',
  shipping: 'shipping',
  conversations: 'conversations',
};

export type BaseDataType = {
  importQueueName: string;
  importUrl: string;
  importUrlLight?: string;
};

export type DataTypesRecord = {
  [dataType in DataTypesIds]: BaseDataType;
};
