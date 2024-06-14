import { FilterProperty, FilterPropertyCategory, FilterPropertyType } from "./FilterProperty";

export const FILTER_PROPERTY_METADATA: Record<FilterProperty, { 
  type: FilterPropertyType,
  category: FilterPropertyCategory,
  isAutoComplete?: boolean
  options?: (string | number)[]
}> = {
  [FilterProperty.ORDER_SOURCE_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ORDERS,
    isAutoComplete: true
  },
  [FilterProperty.ORDER_TAG]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ORDERS,
    isAutoComplete: true
  },
  [FilterProperty.ORDER_PRICE]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.ORDER_DISCOUNT_CODE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ORDERS,
    isAutoComplete: true
  },
  [FilterProperty.ORDER_DESTINATION]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.ORDER_ITEMS]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.ORDER_PAYMENT_STATUS]: {
    type: FilterPropertyType.LIST,
    // https://shopify.dev/docs/api/admin-graphql/unstable/enums/OrderDisplayFinancialStatus
    options: ['authorized', 'expired', 'paid', 'partially_paid', 'partially_refunded', 'pending', 'refunded', 'voided'],
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.ORDER_SUBSCRIPTION_TYPE]: {
    type: FilterPropertyType.LIST,
    options: ['single_purchase', 'subscription_first_purchase', 'subscription_recurring_purchase'],
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.IS_FIRST_ORDER]: {
    type: FilterPropertyType.BOOLEAN,
    category: FilterPropertyCategory.ORDERS,
  },
  [FilterProperty.PAYMENT_GATEWAY_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ORDERS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_ID]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_SKU]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_VARIANT_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_VARIANT_ID]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_TYPE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_CATEGORY]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_VENDOR]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_TAG]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
    isAutoComplete: true
  },
  [FilterProperty.PRODUCT_QUANTITY]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.PRODUCTS,
  },
  [FilterProperty.PRODUCT_COLLECTION]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.PRODUCTS,
  },
  [FilterProperty.CUSTOMER_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_EMAIL]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_PHONE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_HAS_STORE_ACCOUNT]: {
    type: FilterPropertyType.BOOLEAN,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_STORE_ACCOUNT_CREATED_AT]: {
    type: FilterPropertyType.TIME,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_STORE_ACCOUNT_STATUS]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: ['ENABLED', 'DISABLED', 'INVITED', 'DECLINED']
  },
  [FilterProperty.CUSTOMER_TAG]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
    isAutoComplete: true
  },
  [FilterProperty.CUSTOMER_ADDRESS_COUNTRY]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_ADDRESS_STATE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
    isAutoComplete: true
  },
  [FilterProperty.CUSTOMER_ADDRESS_CITY]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_PART_OF_SEGMENT]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_TOTAL_ORDERS_NUMBER]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_TOTAL_SPEND]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_AOV]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_PREDICTED_LTV]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_ACTIVE_SUBSCRIPTIONS_NUMBER]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_IS_LIKELY_TO_CHURN]: {
    type: FilterPropertyType.BOOLEAN,
    category: FilterPropertyCategory.CUSTOMERS,
  },
  [FilterProperty.CUSTOMER_EMAIL_MARKETING_CONSENT]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: ['SUBSCRIBED', 'UNSUBSCRIBED', 'NOT_SUBSCRIBED', 'PENDING', 'INVALID']
  },
  [FilterProperty.CUSTOMER_SMS_MARKETING_CONSENT]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: ['SUBSCRIBED', 'UNSUBSCRIBED', 'NOT_SUBSCRIBED', 'PENDING', 'REDACTED']
  },
  [FilterProperty.CUSTOMER_RFM_RECENCY]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: [1, 2, 3, 4, 5]
  },
  [FilterProperty.CUSTOMER_RFM_FREQUENCY]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: [1, 2, 3, 4, 5]
  },
  [FilterProperty.CUSTOMER_RFM_MONETARY]: {
    type: FilterPropertyType.LIST,
    category: FilterPropertyCategory.CUSTOMERS,
    options: [1, 2, 3, 4, 5]
  },
  [FilterProperty.ATTRIBUTION_SOURCE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_CHANNEL]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_REFERRING_SITE]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_AD_ACCOUNT]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_ID]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_ADSET_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_ADSET_ID]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_AD_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_ADS_AD_ID]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
    isAutoComplete: true,
  },
  [FilterProperty.ATTRIBUTION_EMAIL_SMS_CAMPAIGN_NAME]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_ROAS]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_PIXEL_ROAS]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_CPC]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_CPM]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_AD_SPEND]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_IMPRESSIONS]: {
    type: FilterPropertyType.NUMBER,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.ATTRIBUTION_URL_PATH]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.ATTRIBUTION,
  },
  [FilterProperty.SUBSCRIPTION_STATUS]: {
    type: FilterPropertyType.STRING,
    category: FilterPropertyCategory.SUBSCRIPTIONS,
  },
}
