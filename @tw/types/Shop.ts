import { AccounntingData } from './FinanceTypes';
import { SalesPlatform, ServicesIds } from './services';
import { pricingOffer } from './services/subscription-manager';
import { ShopProviderState } from './types/ShopProviders';
import { AmazonRegions } from './services/amazon';
import { Provider } from './services/account-manager/Provider';
import { CapiSettings } from './pixel/CapiSettings';

export interface Shop {
  id: string;
  createdAt: any;
  currency?: string;
  shopName?: string;
  msp: SalesPlatform;
  mspConnected: boolean;
  earliestDate: Record<string, any>;
  enableRulesEngine: boolean;
  subscriptionActive: boolean;
  subscriptionSource?: string;
  shopifyCreatedAt: Record<string, any>;
  shopifyFirstOrderAt: Record<string, any>;
  lastShopifyImportDate: string;
  facebookAccounts: any[];
  facebookAccessToken: string;
  facebookInvalidConnectionState?: boolean;
  facebookAttributionWindows: string;
  facebookUseAccountTimezone?: boolean;
  features?: `CONF_${string}`[];
  googleAdsAccounts?: any[];
  googleAdsAccessToken?: Record<string, any>;
  googleAdsInvalidConnectionState?: boolean;
  googleSheetsAccounts?: {
    id: string;
    name?: string;
    email?: string;
    picture?: string;
    accessToken: Record<string, string>;
  }[];
  googleAccessToken?: Record<string, any>;
  googleAnalyticsAccounts?: any[];
  googleSheetsAccessToken?: Record<string, any>;
  googleSheetsInvalidConnectionState?: Boolean;
  gradualReleaseKeys?: any;
  forecastingScenarios?: any;
  forecastingStatus?: 'ready' | 'in-progress' | 'failed' | 'deleted';
  forecastingStatusLinear?: 'ready' | 'in-progress' | 'failed' | 'deleted';
  forecastingStatusSeasonal?: 'ready' | 'in-progress' | 'failed' | 'deleted';
  notificationSettings?: any;
  pinterestAccounts?: any[];
  pinterestToken?: Record<string, any>;
  pinterestTokenInvalidConnectionState?: boolean;
  timezone: string;
  tiktokAccessToken: string;
  tiktokAccounts: any[];
  tiktokInvalidConnectionState?: boolean;
  twitterToken?: Record<string, any>;
  twitterAccounts?: {
    [key in string]: {
      accountId: string;
      currency: string;
      timezone: string;
      [props: string]: any;
    };
  };
  twitterInvalidConnectionState?: boolean;
  shopifyUninstalled: boolean;
  snapchatAccessToken: Record<string, any>;
  snapchatAccounts: {
    created_at: string;
    currency: string;
    id: string;
    name: string;
    // missing roles
    selected: boolean;
    status: string;
    timezone: string;
    type: string;
    updated_at: string;
  }[];
  subscription: {
    status?: string;
    pricingOffer?: pricingOffer;
    groupId?: string;
  };
  forceUpgrade?: {
    subscriptionShouldChange?: boolean;
    subscriptionWillChangeAdminOverride?: boolean;
    lastChangeDate?: string;
    lastChangeType?: string;
    uncapped?: {
      uncappedEndDate?: any;
      uncappedTier?: number;
    };
    initialCheckHasRun?: boolean;
  };
  pixel: boolean;
  shopifyAccessToken: string;
  creativeCockpitEnabled: boolean;
  twSurvey: {
    isInstalled?: boolean;
    isEnabled?: boolean;
    id?: number;
    updated_at: string;
  };
  enquirelabsToken: string;
  enquirelabsApiKey: string;
  knoClientId: string;
  knoClientSecret: string;
  knoWebhookSecret: string;
  knoWebhookId: string;
  klaviyoKey?: string;
  klaviyoMetrics?: {
    unsubscribed: string;
    subscribedtolist: string;
    openedemail: string;
    receivedemail: string;
    clickedsms: string;
    clickedemail: string;
    placedorder: string;
  };
  industry?: string;
  stripeAccessToken?: {
    access_token: string;
    livemode: boolean;
    refresh_token: string;
    scope: string;
    stripe_publishable_key: string;
    stripe_user_id: string;
    token_type: string;
  };
  pixel_settings?: {
    allow_auto_install: boolean;
    shop_setup?: {
      shopify?: boolean;
      shopify_checkout?: boolean;
      third_party_checkout?: boolean;
      custom_checkout?: boolean;
      additional_pages?: boolean;
    };
  };
  pixel_install_status?: {
    status?: boolean;
    theme_app_status?: boolean;
    theme_status?: boolean;
    web_pixel_status?: boolean;
    thankyou_status?: boolean;
  };
  capi_settings?: CapiSettings;
  slackAccessToken?: string;
  slackChannelId?: string;
  amazon?: {
    accountsInConfigProcess?: { [key in string]: { initial?: boolean; region: AmazonRegions } };
    sellerAccounts: {
      [key in string]: {
        sellerAccountId: string;
        marketplaceIds: string[];
        region: AmazonRegions;
        currency: string;
        timezone: string;
      };
    };
  };
  attributeFreeOrders?: boolean;
  attributeDraftOrders?: boolean;
  customerIdLookupAttribution?: boolean;
  creativeHubUploadToken?: string;
  pixelWeightNewCustomer?: number;
  pixelWeightReturningCustomer?: number;
  bing?: {
    connectAccountsInProgress?: boolean;
    user?: {
      token: string;
    };
    bingAccounts?: {
      [key in string]: {
        accountId: string;
        currency: string;
        timezone: string;
        [props: string]: any;
      };
    };
  };
  availableFreeFeatures?: any;
  skio?: {
    skioAccounts?: {
      [key in string]: {
        accountId: string;
        [props: string]: any;
      };
    };
  };
  hubspotAccessToken: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  gorgiasAccessToken?: string;
  gorgiasAccountUrl?: string;
  annualRevenue?: {
    days?: number;
    last_calc_date?: string;
    revenue?: number;
    revenueNotConverted?: number;
  };
  averageMonthlyRevenue?: number;
  splitFetchMetricsTable?: boolean;
  providers?: {
    [key in ServicesIds]?: ShopProviderState;
  };
  isTrendsShop?: boolean;
  is3_0Package?: boolean;
  packageVersion?: number;
  isDemoShop?: boolean;
  sourceDemoShop?: string;
}
export interface ShopWithSensory extends Shop {
  sensory: {
    [key in ServicesIds]: Provider;
  };
}
