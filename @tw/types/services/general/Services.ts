import { Shop, ShopWithSensory } from '../../Shop';
import { DataHealthConf } from '../../types';
import {
  ShopIntegrationProperties,
  ShopIntegrationState,
  ShopIntegrationStatusEnum,
  ShopProviderState,
  ShopProviderStatus,
  ShopProviderStatusEnum,
} from '../../types/ShopProviders';
import { DataTypesIds, DataTypesRecord } from './DataTypes';
import { ServicesIds } from './ServicesIds';
import { WorkflowIntegrationStatus } from '../../sensory';

export type BaseChannel<T extends ServicesIds | string> = {
  id: T;
  name: string;
  smallIcon?: string;
  attributionName?: string;
  isSensory?: boolean | ((shop: Shop | ShopWithSensory) => boolean);
  forceOldFetch?: boolean; // temp flag to force old data fetch even it's sensory
  internalUrl: string;
  getAccounts: (shop: Shop | ShopWithSensory) => ShopIntegrationProperties[];
  getAccessToken?: (shop: Shop | ShopWithSensory) => string;
  getIsConnected?: (shop: Shop | ShopWithSensory) => boolean;
  getShopProviderStatus?: (shop: Shop | ShopWithSensory) => ShopProviderStatus;
  dataTypes: Partial<DataTypesRecord>;
  // which datatype to use to determine queue and URL
  // if data type was not specified.
  defaultDataType?: DataTypesIds;
  saveToCreativecockpit?: boolean;
  dateRangeLimit?: number;

  healthCheckSupported?: boolean;
  healthCheckSlackChannel?: string;
  healthCheckConf?: DataHealthConf;
  isBeta?: boolean;
  providerType?: 'none' | 'connector' | 'data';
  isNotInBQ?: boolean;
  twVersion?: string;
};

export type ServicesRecordInternal = {
  [channel in ServicesIds]: BaseChannel<channel>;
};

export type ServicesRecord = {
  [channel in ServicesIds]: BaseChannel<channel> & {
    providerType: 'none' | 'connector' | 'data';
  };
};

export const extractSensoryAccounts = (
  shop: ShopWithSensory,
  providerId: ServicesIds
): ShopIntegrationProperties[] => {
  return (shop.sensory?.[providerId]?.integrations
    ?.map((x) => {
      return {
        id: x.id,
        providerAccount: x.provider_account,
        integrationId: x.id,
        name: x.name,
        currency: x.extra_params?.currency,
        timezone: x.extra_params?.timezone,
        settings: x.settings,
        status: x.status as ShopIntegrationStatusEnum,
        workflowStatus: x.workflowStatus as WorkflowIntegrationStatus[],
        errorMessage: x.errorMessage,
      };
    })
    ?.filter((int) => int.status != ShopIntegrationStatusEnum.deleted) ??
    []) as ShopIntegrationProperties[];
};

export const extractSensoryIsConnected = (shop: ShopWithSensory, providerId: ServicesIds) => {
  return shop.sensory?.[providerId]?.credentials?.length > 0;
};

export const extractSensoryProviderStatus = (
  shop: ShopWithSensory,
  providerId: ServicesIds
): ShopProviderStatus => {
  const isConnected = extractSensoryIsConnected(shop, providerId);
  //TODO: get error
  if (!isConnected) return { status: ShopProviderStatusEnum.disconnected };
  const integrations = services[providerId]
    .getAccounts(shop)
    ?.filter(
      (acc) =>
        ![ShopIntegrationStatusEnum.deleted, ShopIntegrationStatusEnum.disconnected].includes(
          acc.status
        )
    );
  if (!integrations?.length) {
    return { status: ShopProviderStatusEnum.pending };
  }
  const errorIntegration: ShopIntegrationProperties = integrations.find(
    (x: ShopIntegrationProperties) => x?.status == ShopIntegrationStatusEnum.error
  );
  if (errorIntegration) {
    return {
      status: ShopProviderStatusEnum.connected,
      errorMessage: errorIntegration.errorMessage ?? 'Connection Error',
    };
  }

  const backfillIntegration: ShopIntegrationProperties = integrations.find(
    (x: ShopIntegrationProperties) => x?.status == ShopIntegrationStatusEnum.backfill
  );
  if (backfillIntegration) {
    return {
      status: ShopProviderStatusEnum.backfill,
    };
  }

  return { status: ShopProviderStatusEnum.connected };
};
export const extractShopProviderStatus = (
  shop: Shop,
  providerId: ServicesIds
): ShopProviderStatus => {
  const accessToken = services[providerId].getAccessToken(shop);
  if (!accessToken) return { status: ShopProviderStatusEnum.disconnected };
  const providerState = shop.providers?.[providerId] as ShopProviderState;
  const integrations = services[providerId].getAccounts(shop);
  if (!integrations?.length) {
    return providerState?.error
      ? {
          status: ShopProviderStatusEnum.connected,
          errorMessage: providerState?.error?.errorMessage,
        }
      : {
          //for bing,twitter
          status: accessToken?.toLowerCase().includes('go to')
            ? ShopProviderStatusEnum.disconnected
            : ShopProviderStatusEnum.pending,
        };
  }
  if (providerState?.integrations) {
    const errorIntegration: ShopIntegrationState = Object.values(providerState?.integrations).find(
      (x: ShopIntegrationState) => x?.status == ShopIntegrationStatusEnum.error
    );
    if (errorIntegration) {
      return {
        status: ShopProviderStatusEnum.connected,
        errorMessage: errorIntegration?.error?.errorMessage,
      };
    }
  }
  return { status: ShopProviderStatusEnum.connected };
};

export const extractAccounts = (
  integrations: { id: string; name?: string; timezone?: string; currency?: string }[],
  integrationsState: { [key in string]?: ShopIntegrationState }
): ShopIntegrationProperties[] => {
  return (integrations || []).map((x) => {
    const integrationState = integrationsState?.[x.id];
    return {
      id: x.id,
      providerAccount: x.id,
      name: x.name || x.id,
      currency: x.currency,
      timezone: x.timezone,
      status: integrationState?.status ?? ShopIntegrationStatusEnum.ready,
      errorMessage: integrationState?.error?.errorMessage,
    };
  });
};

const _services: ServicesRecordInternal = {
  'shopify-segment': {
    id: 'shopify-segment',
    name: 'Shopify segment',
    smallIcon: 'triple-whale-logo',
    internalUrl: 'shopify-segment',
    getAccounts: () => [],
    dataTypes: {},
    providerType: 'none',
    isNotInBQ: true,
  },
  'facebook-ads': {
    id: 'facebook-ads',
    name: 'Facebook ads',
    smallIcon: 'facebook-circle',
    internalUrl: 'facebook-ads',
    getAccounts: (shop: Shop) =>
      extractAccounts(shop?.facebookAccounts, shop?.providers?.['facebook-ads']?.integrations),
    getAccessToken: (shop: Shop) => shop.facebookAccessToken,
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'facebook-ads-import-day-data',
        importUrl: 'import-day-data',
        importUrlLight: 'import-day-data-light',
      },
      'ads-settings': {
        importQueueName: 'facebook-ads-import-day-settings-data',
        importUrl: 'import-day-settings-data',
      },
    },
    defaultDataType: 'ads-metrics',
    healthCheckSupported: true,
    healthCheckSlackChannel: 'C03TV7S9084',
    saveToCreativecockpit: true,
    healthCheckConf: {
      fields: {
        spend: { isCritical: true },
        impressions: { isCritical: false },
        outboundClicks: {
          isCritical: false,
          label: 'Outbound clicks',
        },
        clicks: { isCritical: true },
        purchases: {
          isCritical: true,
          label: 'Purchases (web)',
        },
        metaPurchases: {
          isCritical: true,
          label: 'Purchases (meta)',
        },
        conversionValue: {
          isCritical: true,
          label: 'Conversion value',
        },
        metaConversionValue: {
          isCritical: true,
          label: 'Conversion value (meta)',
        },
        oneDayViewPurchasesValue: { label: 'One Day View Purchases Value' },
      },
    },
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'facebook-ads'),
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google ads',
    smallIcon: 'google-ads',
    internalUrl: 'google-ads',
    getAccounts: (shop: Shop) =>
      extractAccounts(
        Object.entries<any>(shop.googleAdsAccounts || {})?.map(([id, value]) => ({
          id: id.replace('customers/', ''),
          currency: value.currency_code,
          name: value.descriptive_name,
          ...value,
        })),
        shop?.providers?.['google-ads']?.integrations
      ),
    getAccessToken: (shop: Shop) => shop.googleAdsAccessToken?.access_token,
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'google-ads-import-day-data',
        importUrl: 'import-day-data',
      },
      'ads-settings': {
        importQueueName: 'google-ads-import-day-settings-data',
        importUrl: 'import-day-settings-data',
      },
    },
    defaultDataType: 'ads-metrics',
    healthCheckSupported: true,
    healthCheckSlackChannel: 'C03TSHW57D1',
    healthCheckConf: {
      fields: {
        spend: { isCritical: true },
        impressions: { isCritical: false },
        clicks: { isCritical: true },
        purchases: { isCritical: true },
        conversionValue: { isCritical: true },
      },
    },
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'google-ads'),
  },
  'tiktok-ads': {
    id: 'tiktok-ads',
    name: 'TikTok ads',
    smallIcon: 'tiktok',
    internalUrl: 'tiktok-ads',
    getAccounts: (shop: Shop) =>
      extractAccounts(
        shop.tiktokAccounts?.map((acc) => ({
          currency: shop.currency, // in case there's no account currency
          ...acc,
        })),
        shop?.providers?.['tiktok-ads']?.integrations
      ),
    getAccessToken: (shop: Shop) => {
      if (!shop.tiktokAccessToken) {
        return null;
      }
      try {
        return JSON.parse(shop.tiktokAccessToken)?.data?.access_token;
      } catch {
        return null;
      }
    },
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'tiktok-ads-import-day-data',
        importUrl: 'import-day-data',
      },
      'ads-settings': {
        importQueueName: 'tiktok-ads-import-day-settings-data',
        importUrl: 'ads-settings/import-day-settings-data',
      },
    },
    defaultDataType: 'ads-metrics',
    healthCheckSupported: true,
    healthCheckSlackChannel: 'C03TV5H7E84',
    saveToCreativecockpit: true,
    dateRangeLimit: 365,
    healthCheckConf: {
      fields: {
        spend: { isCritical: true },
        impressions: { isCritical: false },
        clicks: { isCritical: true },
        purchases: { isCritical: true },
        conversionValue: { isCritical: true },
        totalCompletePaymentRate: {
          isCritical: true,
          label: 'Complete payment rate',
        },
        totalOnWebOrderValue: {
          isCritical: true,
          label: 'Web order value',
        },
        completePayment: {
          isCritical: true,
          label: 'Complete Payment',
        },
        onWebOrder: { isCritical: true, label: 'Web Order' },
      },
    },
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'tiktok-ads'),
  },
  'snapchat-ads': {
    id: 'snapchat-ads',
    name: 'Snapchat ads',
    internalUrl: 'snapchat-ads',
    smallIcon: 'snapchat-circle',
    getAccounts: (shop: Shop) =>
      extractAccounts(shop?.snapchatAccounts, shop?.providers?.['snapchat-ads']?.integrations),
    getAccessToken: (shop: Shop) => shop.snapchatAccessToken?.access_token,
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'snapchat-ads-import-day-data-temp',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'ads-metrics',
    healthCheckSupported: true,
    healthCheckSlackChannel: 'C04A27LHW2Y',
    healthCheckConf: {
      isSerialPeriodsChecks: true,
      fields: {
        spend: { isCritical: true },
      },
    },
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'snapchat-ads'),
  },
  'pinterest-ads': {
    id: 'pinterest-ads',
    smallIcon: 'pinterest',
    name: 'Pinterest ads',
    internalUrl: 'pinterest-ads',
    getAccounts: (shop: Shop) =>
      extractAccounts(shop?.pinterestAccounts, shop?.providers?.['pinterest-ads']?.integrations),
    getAccessToken: (shop: Shop) => shop.pinterestToken?.access_token,
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'pinterest-ads-import-day-data',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'ads-metrics',
    healthCheckSlackChannel: 'C049HE43GM7',
    healthCheckSupported: true,
    dateRangeLimit: 185,
    healthCheckConf: {
      isSerialPeriodsChecks: true,
      fields: {
        spend: { isCritical: true, minDelta: 15 },
        impressions: { isCritical: false, minDelta: 15 },
        clicks: { isCritical: true, minDelta: 15 },
        purchases: { isCritical: true, minDelta: 15 },
        conversionValue: { isCritical: true, minDelta: 15 },
      },
    },
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'pinterest-ads'),
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    smallIcon: 'shopify',
    internalUrl: 'shopify',
    // TODO: temp
    getAccounts: (shop: Shop) => [
      {
        id: shop.isDemoShop ? shop.sourceDemoShop : shop.id,
        name: shop.shopName,
        providerAccount: shop.isDemoShop ? shop.sourceDemoShop : shop.id,
        currency: shop.currency,
        timezone: shop.timezone,
      },
    ],
    getAccessToken: (shop: Shop) => shop.shopifyAccessToken,
    dataTypes: {
      orders: {
        importQueueName: 'shopify-import-day-data-temp',
        importUrl: 'import-day-data',
      },
      products: {
        importQueueName: 'shopify-import-day-data-temp',
        importUrl: 'import-day-data',
      },
      'ads-settings': {
        importQueueName: 'shopify-import-day-data-temp',
        importUrl: 'import-day-settings-data',
      },
    },
    defaultDataType: 'orders',
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'shopify'),
  },
  enquirelabs: {
    id: 'enquirelabs',
    name: 'Fairing',
    smallIcon: 'fairing',
    attributionName: 'enquirelab',
    internalUrl: 'enquirelabs',
    getAccounts: (shop: Shop) =>
      shop.enquirelabsToken
        ? [
            {
              id: shop.id,
              providerAccount: shop.id,
              currency: shop.currency,
            },
          ]
        : [],
    getAccessToken: (shop: Shop) => shop.enquirelabsToken,
    dataTypes: {
      surveys: {
        importQueueName: 'enquirelabs-import-day-data',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'surveys',
    isNotInBQ: true,
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'enquirelabs'),
  },
  kno: {
    id: 'kno',
    name: 'Kno',
    smallIcon: 'kno',
    internalUrl: 'kno',
    getAccounts: (shop: Shop) =>
      shop.knoClientSecret
        ? [{ id: shop.id, providerAccount: shop.id, currency: shop.currency }]
        : [],
    getAccessToken: (shop: Shop) => shop.knoClientSecret,
    dataTypes: {
      surveys: {
        importQueueName: 'kno-import-day-data',
        importUrl: 'import-day-data',
      },
    },
    isNotInBQ: true,
    defaultDataType: 'surveys',
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'kno'),
  },
  benchmarks: {
    id: 'benchmarks',
    smallIcon: 'triple-whale-logo',
    name: 'Benchmarks',
    internalUrl: 'ai',
    getAccounts: () => [],
    dataTypes: {},
    isNotInBQ: true,
    providerType: 'none',
  },
  influencers: {
    id: 'influencers',
    smallIcon: 'affluencer',
    name: 'Influencers',
    internalUrl: 'acquisition',
    getAccounts: () => [],
    dataTypes: {},
    providerType: 'none',
  },
  amazon: {
    id: 'amazon',
    smallIcon: 'amazon',
    name: 'Amazon',
    internalUrl: 'amazon',
    getAccounts: (shop: any) => {
      if (!shop.amazon) {
        return [
          ...new Set(
            Object.values(shop.tw_account_ids || {})
              .map((val: any) => val.marketplace_ids)
              .flat()
          ),
        ]?.map((id) => ({ id, providerAccount: id, currency: '' }));
      } else {
        return Object.keys(shop?.amazon?.sellerAccounts || {})?.map((id) => ({
          id,
          providerAccount: id,
          currency: '',
        }));
      }
    },
    dataTypes: {
      orders: {
        importQueueName: 'amazon-import-day-data',
        importUrl: 'import-day-data',
      },
      'ads-metrics': {
        importQueueName: 'amazon-import-day-data-ads',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'orders',
    getAccessToken: (shop: Shop) => 'go to mongodb', //temp
    isBeta: false,
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'amazon'),
  },
  'twitter-ads': {
    id: 'twitter-ads',
    name: 'Twitter Ads',
    smallIcon: 'twitter',
    internalUrl: 'twitter-ads',
    getAccounts: (shop: Shop) =>
      extractAccounts(
        Object.values(shop.twitterAccounts || {})?.map((id: any) => ({
          id: id.accountId,
          currency: '',
        })),
        shop?.providers?.['twitter-ads']?.integrations
      ),
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'twitter-ads-import-day-data-ads',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'ads-metrics',
    getAccessToken: (shop) => 'go to twitter collection', //temp
    isBeta: false,
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'twitter-ads'),
  },
  skio: {
    id: 'skio',
    name: 'Skio',
    smallIcon: 'skio',
    internalUrl: 'skio',
    dataTypes: {},
    defaultDataType: 'ads-metrics',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'skio'),
    isBeta: true,
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'skio'),
  },
  pixel: {
    id: 'pixel',
    smallIcon: 'pixel',
    name: 'Pixel',
    internalUrl: 'pixel',
    getAccounts: (shop: Shop) => [
      { id: shop.id, providerAccount: shop.id, currency: shop.currency },
    ],
    providerType: 'data',
    dataTypes: {},
    getShopProviderStatus: (shop: Shop) => ({ status: ShopProviderStatusEnum.connected }),
  },
  pps: {
    id: 'pps',
    smallIcon: 'pps',
    name: 'Post-Purchase Survey',
    internalUrl: 'pps',
    getAccounts: (shop: Shop) =>
      shop.twSurvey
        ? [
            {
              id: `${shop.twSurvey?.id}`,
              providerAccount: `${shop.twSurvey?.id}`,
              currency: shop.currency,
            },
          ]
        : [],
    providerType: 'data',
    dataTypes: {},
    getShopProviderStatus: (shop: Shop) =>
      shop.twSurvey?.isEnabled && shop.twSurvey?.isInstalled
        ? { status: ShopProviderStatusEnum.connected }
        : { status: ShopProviderStatusEnum.disconnected },
  },
  'triple-whale': {
    id: 'triple-whale',
    name: 'Triple Whale',
    smallIcon: 'triple-whale-logo',
    internalUrl: 'triple-whale',
    getAccounts: (shop: Shop) => [
      { id: shop.id, providerAccount: shop.id, currency: shop.currency },
    ],
    isNotInBQ: true,
    providerType: 'none',
    dataTypes: {},
  },
  recharge: {
    id: 'recharge',
    name: 'Recharge',
    smallIcon: 'recharge',
    internalUrl: 'recharge',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'recharge'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'recharge'),
  },
  'website-content': {
    id: 'website-content',
    name: 'Web site content',
    internalUrl: 'website-content',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'website-content'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'website-content'),
  },
  hubspot: {
    id: 'hubspot',
    name: 'Hubspot',
    smallIcon: 'hubspot',
    internalUrl: 'hubspot',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'hubspot'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'hubspot'),
    defaultDataType: 'contacts',
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    smallIcon: 'slack',
    internalUrl: 'slack',
    getAccounts: (shop) =>
      shop.slackChannelId
        ? [
            {
              id: shop.slackChannelId,
              providerAccount: shop.slackChannelId,
              currency: shop.currency,
            },
          ]
        : [],
    dataTypes: {},
    providerType: 'connector',
    isNotInBQ: true,
    getAccessToken: (shop: Shop) => shop.slackAccessToken,
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'slack'),
  },
  'google-sheets': {
    id: 'google-sheets',
    name: 'Google Sheets',
    smallIcon: 'google-sheet',
    internalUrl: 'google-sheets',
    getAccounts: (shop) =>
      (shop.googleSheetsAccounts ?? []).map((account) => ({
        id: account.id,
        providerAccount: account.id,
        currency: shop.currency,
      })),
    dataTypes: {},
    providerType: 'connector',
    isNotInBQ: true,
    getAccessToken: (shop: Shop) => shop.googleSheetsAccounts?.[0]?.accessToken?.access_token || '',
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'google-sheets'),
  },
  mountain: {
    id: 'mountain',
    smallIcon: 'mountain',
    name: 'Mountain',
    internalUrl: 'mountain',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'mountain'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'mountain'),
  },
  woocommerce: {
    id: 'woocommerce',
    name: 'Woocommerce',
    smallIcon: 'woocommerce',
    internalUrl: 'woocommerce',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'woocommerce'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'woocommerce'),
  },
  bigcommerce: {
    id: 'bigcommerce',
    name: 'bigcommerce',
    smallIcon: 'bigcommerce',
    internalUrl: 'bigcommerce',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'bigcommerce'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'bigcommerce'),
  },
  tatari: {
    id: 'tatari',
    name: 'Tatari',
    smallIcon: 'tatari',
    internalUrl: 'tatari',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'tatari'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'tatari'),
  },
  criteo: {
    id: 'criteo',
    name: 'Criteo',
    smallIcon: 'criteo',
    internalUrl: 'criteo',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'criteo'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'criteo'),
    defaultDataType: 'ads-metrics',
    twVersion: '3.0',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    smallIcon: 'linkedin',
    internalUrl: 'linkedin',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'linkedin'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'linkedin'),
    defaultDataType: 'ads-metrics',
  },
  stripe: {
    id: 'stripe',
    smallIcon: 'stripe',
    name: 'Stripe',
    internalUrl: 'stripe',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'stripe'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'stripe'),
    defaultDataType: 'balanceTransactions',
  },
  atlassian: {
    id: 'atlassian',
    name: 'Atlassian',
    smallIcon: 'atlassian',
    internalUrl: 'atlassian',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'atlassian'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'atlassian'),
    defaultDataType: 'issues',
    twVersion: '3.0',
  },
  smsbump: {
    id: 'smsbump',
    name: 'Yotpo',
    smallIcon: 'smsbump',
    internalUrl: 'smsbump',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'smsbump'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'smsbump'),
  },
  postscript: {
    id: 'postscript',
    smallIcon: 'postscript',
    name: 'postscript',
    internalUrl: 'postscript',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'postscript'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'postscript'),
  },
  shipstation: {
    id: 'shipstation',
    smallIcon: 'shipstation',
    name: 'Shipstation',
    internalUrl: 'shipstation',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'shipstation'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'shipstation'),
  },
  'tiktok-shops': {
    id: 'tiktok-shops',
    smallIcon: 'tiktok',
    name: 'TikTok Shops',
    internalUrl: 'tiktok-shops',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'tiktok-shops'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'tiktok-shops'),
  },
  gorgias: {
    id: 'gorgias',
    smallIcon: 'gorgias',
    name: 'Gorgias',
    internalUrl: 'gorgias',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'gorgias'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'gorgias'),
  },
  shipbob: {
    id: 'shipbob',
    smallIcon: 'shipbob',
    name: 'Shipbob',
    internalUrl: 'shipbob',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'shipbob'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'shipbob'),
  },
  taboola: {
    id: 'taboola',
    smallIcon: 'taboola',
    name: 'Taboola',
    internalUrl: 'taboola',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'taboola'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'taboola'),
    twVersion: '3.0',
  },
  okendo: {
    id: 'okendo',
    name: 'Okendo',
    smallIcon: 'okendo',
    internalUrl: 'okendo',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'okendo'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'okendo'),
    twVersion: '3.0',
  },
  adroll: {
    id: 'adroll',
    smallIcon: 'adroll',
    name: 'Adroll',
    internalUrl: 'adroll',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'adroll'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'adroll'),
  },
  outbrain: {
    id: 'outbrain',
    smallIcon: 'outbrain',
    name: 'Outbrain',
    internalUrl: 'outbrain',
    isSensory: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'outbrain'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'outbrain'),
    twVersion: '3.0',
  },
  'google-analytics': {
    id: 'google-analytics',
    name: 'Google analytics',
    smallIcon: 'google-analytics',
    internalUrl: 'google-analytics',
    getAccounts: (shop: Shop) =>
      (shop?.googleAnalyticsAccounts || [])?.map((acc: any) => ({
        id: acc.id,
        providerAccount: acc.id,
        name: acc.name,
        currency: acc.currency,
      })),
    dataTypes: {},
    isNotInBQ: true,
    getAccessToken: (shop) => shop.googleAccessToken?.access_token ?? '',
    getShopProviderStatus: (shop: Shop) => extractShopProviderStatus(shop, 'google-analytics'),
  },
  intercom: {
    id: 'intercom',
    name: 'Intercom',
    smallIcon: 'intercom',
    internalUrl: 'intercom',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'intercom'),
    dataTypes: {},
    defaultDataType: 'conversations',
    getShopProviderStatus: (shop: ShopWithSensory) =>
      extractSensoryProviderStatus(shop, 'intercom'),
  },
  gcp: {
    id: 'gcp',
    name: 'GCP',
    smallIcon: 'gcp',
    internalUrl: 'gcp',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'gcp'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'gcp'),
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog',
    smallIcon: 'posthog',
    internalUrl: 'posthog',
    isSensory: true,
    isBeta: true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'posthog'),
    dataTypes: {},
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'posthog'),
  },
  klaviyo: {
    id: 'klaviyo',
    name: 'Klaviyo',
    smallIcon: 'klaviyo',
    internalUrl: 'klaviyo',
    isSensory: (shop: ShopWithSensory) => !shop.klaviyoKey,
    getAccounts: (shop: ShopWithSensory) => {
      const accounts = [];
      if (shop.klaviyoKey) {
        accounts.push([
          {
            id: shop.id,
            providerAccount: shop.id,
            currency: shop.currency,
          },
        ]);
      }
      accounts.push(extractSensoryAccounts(shop, 'klaviyo'));
      return accounts.flat();
    },
    getIsConnected: (shop: ShopWithSensory) => extractSensoryIsConnected(shop, 'klaviyo'),
    getAccessToken: (shop: Shop) => shop.klaviyoKey,
    dataTypes: {
      'ads-metrics': {
        importQueueName: 'klaviyo-import-day-data',
        importUrl: 'import-day-data',
      },
    },
    defaultDataType: 'ads-metrics',
    getShopProviderStatus: (shop: ShopWithSensory) =>
      shop.klaviyoKey
        ? extractShopProviderStatus(shop, 'klaviyo')
        : extractSensoryProviderStatus(shop, 'klaviyo'),
  },
  bing: {
    id: 'bing',
    name: 'Microsoft Ads',
    smallIcon: 'microsoft',
    internalUrl: 'bing',
    isSensory: (shop: ShopWithSensory) => true,
    getAccounts: (shop: ShopWithSensory) => extractSensoryAccounts(shop, 'bing'),
    forceOldFetch: true,
    getIsConnected: (shop: ShopWithSensory) => extractSensoryIsConnected(shop, 'bing'),
    getShopProviderStatus: (shop: ShopWithSensory) => extractSensoryProviderStatus(shop, 'bing'),
    defaultDataType: 'ads-metrics',
    dataTypes: {},
  }
};

const getIsConnected = (
  getShopProviderStatus?: (shop: Shop | ShopWithSensory) => ShopProviderStatus,
  shop?: ShopWithSensory
) => {
  if (!getShopProviderStatus) return false;
  const shopProviderStatus = getShopProviderStatus(shop);
  return (
    shopProviderStatus?.status && shopProviderStatus.status !== ShopProviderStatusEnum.disconnected
  );
};

export const services: ServicesRecord = Object.keys(_services).reduce((acc, key) => {
  const service = _services[key];
  acc[key] = {
    ...service,
    providerType: service.providerType ?? 'data',
    getIsConnected: (shop: ShopWithSensory) =>
      getIsConnected(service.getShopProviderStatus, shop) && service.providerType !== 'none',
  };
  return acc;
}, {} as ServicesRecord);
