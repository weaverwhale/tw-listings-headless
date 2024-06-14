import { SubscriptionFeature } from '../../../types';
import { FilterProperty } from '../../insights';
import { CDPActionFilterActions, CDPActionProperty } from './ActionFilter';

// Identifies which properties to display for each action
export const ACTION_FILTER_RELATED_PROPERTIES: {
  [key in CDPActionFilterActions]: CDPActionProperty[];
} = {
  [CDPActionFilterActions.MADE_PURCHASE]: [
    FilterProperty.PRODUCT_NAME,
    FilterProperty.PRODUCT_ID,
    FilterProperty.ORDER_TAG,
    FilterProperty.ORDER_PRICE,
    FilterProperty.ORDER_ITEMS,
    FilterProperty.ORDER_DISCOUNT_CODE,
    FilterProperty.ATTRIBUTION_SOURCE,
    FilterProperty.ORDER_SUBSCRIPTION_TYPE,
  ],
  [CDPActionFilterActions.CLICKED_AD]: [
    FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_ID,
    FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_NAME,
    FilterProperty.ATTRIBUTION_ADS_ADSET_ID,
    FilterProperty.ATTRIBUTION_ADS_ADSET_NAME,
    FilterProperty.ATTRIBUTION_ADS_AD_ID,
    FilterProperty.ATTRIBUTION_ADS_AD_NAME,
    FilterProperty.ATTRIBUTION_SOURCE,
  ],
  [CDPActionFilterActions.VISITED_URL]: [FilterProperty.ATTRIBUTION_URL_PATH],
  [CDPActionFilterActions.STARTED_SUBSCRIPTION]: [
    FilterProperty.SUBSCRIPTION_STATUS,
  ],
  [CDPActionFilterActions.UPDATED_SUBSCRIPTION]: [],
  [CDPActionFilterActions.CANCELLED_SUBSCRIPTION]: []
};

// Identifies which actions depend on a specific feature
export const FEATURES_RELATED_ACTIONS: { [key in CDPActionFilterActions]?: SubscriptionFeature[] } = {
  [CDPActionFilterActions.CLICKED_AD]: [SubscriptionFeature.PIXEL],
  [CDPActionFilterActions.VISITED_URL]: [SubscriptionFeature.PIXEL],
};

export const UN_SUPPORTED_PROPERTIES = [
  FilterProperty.SUBSCRIPTION_STATUS,
  FilterProperty.CUSTOMER_ACTIVE_SUBSCRIPTIONS_NUMBER,
  FilterProperty.ORDER_SUBSCRIPTION_TYPE,
];

export const UN_SUPPORTED_ACTIONS = [
  CDPActionFilterActions.STARTED_SUBSCRIPTION,
  CDPActionFilterActions.UPDATED_SUBSCRIPTION,
  CDPActionFilterActions.CANCELLED_SUBSCRIPTION,
];
