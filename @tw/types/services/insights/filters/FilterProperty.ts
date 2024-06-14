export enum FilterPropertyType {
  STRING = 'string',
  NUMBER = 'number',
  TIME = 'time',
  BOOLEAN = 'boolean',
  LIST = 'list',
  REPEATED_STRING = 'repeated string',
}

export enum FilterPropertyCategory {
  ORDERS = 'orders',
  SUBSCRIPTIONS = 'subscriptions',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  ATTRIBUTION = 'attribution',
}

export enum FilterProperty {
  //  ORDER
  ORDER_SOURCE_NAME = 'order_source_name',
  ORDER_TAG = 'order_tag',
  ORDER_PRICE = 'order_value',
  ORDER_DISCOUNT_CODE = 'discount_code',
  ORDER_DESTINATION = 'order_destination',
  ORDER_ITEMS = 'items_number',
  ORDER_SUBSCRIPTION_TYPE = 'order_subscription_type',
  ORDER_PAYMENT_STATUS = 'order_payment_status',
  IS_FIRST_ORDER = 'is_first_order',
  PAYMENT_GATEWAY_NAME = 'payment_gateway_name',

  // SUBSCRIPTION
  SUBSCRIPTION_STATUS = 'subscription_status',

  // PRODUCT
  PRODUCT_NAME = 'product_name',
  PRODUCT_ID = 'product_id',
  PRODUCT_SKU = 'product_sku',
  PRODUCT_VARIANT_NAME = 'product_variant_name',
  PRODUCT_VARIANT_ID = 'product_variant_id',
  PRODUCT_TYPE = 'product_type',
  PRODUCT_CATEGORY = 'product_category',
  PRODUCT_VENDOR = 'product_vendor',
  PRODUCT_TAG = 'product_tag',
  PRODUCT_QUANTITY = 'product_quantity',
  PRODUCT_COLLECTION = 'product_collection',

  // CUSTOMER
  CUSTOMER_NAME = 'name',
  CUSTOMER_EMAIL = 'email',
  CUSTOMER_PHONE = 'phone',
  CUSTOMER_HAS_STORE_ACCOUNT = 'customer_has_store_account',
  CUSTOMER_STORE_ACCOUNT_CREATED_AT = 'customer_store_account_created_at',
  CUSTOMER_STORE_ACCOUNT_STATUS = 'customer_store_account_status',
  CUSTOMER_TAG = 'customer_tag',
  CUSTOMER_ADDRESS_COUNTRY = 'country',
  CUSTOMER_ADDRESS_STATE = 'state',
  CUSTOMER_ADDRESS_CITY = 'city',
  CUSTOMER_PART_OF_SEGMENT = 'customer_part_of_segment',
  CUSTOMER_TOTAL_ORDERS_NUMBER = 'total_orders_number',
  CUSTOMER_TOTAL_SPEND = 'customer_total_spend',
  CUSTOMER_AOV = 'customer_aov',
  CUSTOMER_EMAIL_MARKETING_CONSENT = 'customer_email_marketing_consent',
  CUSTOMER_SMS_MARKETING_CONSENT = 'customer_sms_marketing_consent',
  CUSTOMER_PREDICTED_LTV = 'customer_predicted_ltv',
  CUSTOMER_IS_LIKELY_TO_CHURN = 'customer_is_likely_to_churn',
  CUSTOMER_ACTIVE_SUBSCRIPTIONS_NUMBER = 'customer_active_subscriptions_number',

  // RFM
  CUSTOMER_RFM_RECENCY = 'customer_rfm_recency',
  CUSTOMER_RFM_FREQUENCY = 'customer_rfm_frequency',
  CUSTOMER_RFM_MONETARY = 'customer_rfm_monetary',

  // ATTRIBUTION
  ATTRIBUTION_SOURCE = 'source',
  ATTRIBUTION_CHANNEL = 'attribution_channel',
  ATTRIBUTION_REFERRING_SITE = 'attribution_referring_site',
  ATTRIBUTION_AD_ACCOUNT = 'attribution_ad_account',
  ATTRIBUTION_ADS_CAMPAIGN_NAME = 'campaign_name',
  ATTRIBUTION_ADS_CAMPAIGN_ID = 'campaign_id',
  ATTRIBUTION_ADS_ADSET_NAME = 'ad_group_name',
  ATTRIBUTION_ADS_ADSET_ID = 'ad_group_id',
  ATTRIBUTION_ADS_AD_NAME = 'ad_name',
  ATTRIBUTION_ADS_AD_ID = 'ad_id',
  ATTRIBUTION_EMAIL_SMS_CAMPAIGN_NAME = 'attribution_email_sms_campaign_name',
  ATTRIBUTION_ROAS = 'attribution_roas',
  ATTRIBUTION_PIXEL_ROAS = 'attribution_pixel_roas',
  ATTRIBUTION_CPC = 'attribution_cpc',
  ATTRIBUTION_CPM = 'attribution_cpm',
  ATTRIBUTION_AD_SPEND = 'attribution_ad_spend',
  ATTRIBUTION_IMPRESSIONS = 'attribution_impressions',
  ATTRIBUTION_URL_PATH = 'url_path',
}
