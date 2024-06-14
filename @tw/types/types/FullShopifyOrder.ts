export interface FullShopifyOrder {
  shopDomain: string;
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason?: any;
  cancelled_at?: any;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: ClientDetails;
  closed_at?: any;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: ShopPresentedMoney;
  current_total_discounts: string;
  current_total_discounts_set: ShopPresentedMoney;
  current_total_duties_set?: any;
  current_total_price: string;
  current_total_price_set: ShopPresentedMoney;
  current_total_tax: string;
  current_total_tax_set: ShopPresentedMoney;
  customer_locale: string;
  device_id?: any;
  discount_codes?: any[] | any;
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status?: any;
  gateway: string;
  landing_site: string;
  landing_site_ref?: any;
  location_id?: any;
  name: string;
  note?: any;
  note_attributes?: NameVal[] | null;
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set?: any;
  payment_gateway_names?: string[] | null;
  phone?: any;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  reference?: any;
  referring_site: string;
  source_identifier?: any;
  source_name: string;
  source_url?: any;
  subtotal_price: string;
  subtotal_price_set: ShopPresentedMoney;
  tags: string;
  tax_lines?: TaxLinesEntity[] | null;
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: ShopPresentedMoney;
  total_line_items_price: string;
  total_line_items_price_set: ShopPresentedMoney;
  total_outstanding: string;
  total_price: string;
  total_price_set: ShopPresentedMoney;
  total_price_usd: string;
  total_shipping_price_set: ShopPresentedMoney;
  total_tax: string;
  total_tax_set: ShopPresentedMoney;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id?: any;
  billing_address: ShopifyBillingAddress;
  customer: Customer;
  discount_applications?: DiscountApplicationsEntity[] | null;
  fulfillments?: null[] | null;
  line_items?: LineItemsEntity[] | null;
  payment_details: PaymentDetails;
  refunds?: null[] | null;
  shipping_address: ShopifyBillingAddress;
  shipping_lines?: ShippingLinesEntity[] | null;
  cogs: number;
  shopCode: string;
}
export interface ClientDetails {
  accept_language: string;
  browser_height?: any;
  browser_ip: string;
  browser_width?: any;
  session_hash?: any;
  user_agent: string;
}
export interface ShopPresentedMoney {
  shop_money: Amount;
  presentment_money: Amount;
}
interface Amount {
  amount: string;
  currency_code: string;
}
interface NameVal {
  name: string;
  value: string;
}
interface TaxLinesEntity {
  price: string;
  rate: number;
  title: string;
  price_set: ShopPresentedMoney;
  channel_liable: boolean;
}
export interface ShopifyBillingAddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2?: any;
  company?: any;
  latitude: number;
  longitude: number;
  name: string;
  country_code: string;
  province_code: string;
}
export interface Customer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note?: any;
  verified_email: boolean;
  multipass_identifier?: any;
  tax_exempt: boolean;
  phone?: any;
  tags: string;
  last_order_name: string;
  currency: string;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string;
  tax_exemptions?: null[] | null;
  admin_graphql_api_id: string;
  default_address: DefaultAddress;
}
export interface DefaultAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company?: any;
  address1: string;
  address2?: any;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}
export interface DiscountApplicationsEntity {
  target_type: string;
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  title: string;
  description: string;
}
export interface LineItemsEntity {
  id: number;
  admin_graphql_api_id: string;
  destination_location: DestinationLocationOrOriginLocation;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status?: any;
  gift_card: boolean;
  grams: number;
  name: string;
  origin_location: DestinationLocationOrOriginLocation;
  pre_tax_price: string;
  pre_tax_price_set: ShopPresentedMoney;
  price: string;
  price_set: ShopPresentedMoney;
  product_exists: boolean;
  product_id: number;
  properties?: null[] | null;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  tax_code: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: ShopPresentedMoney;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: string;
  tax_lines?: TaxLinesEntity[] | null;
  duties?: null[] | null;
  discount_allocations?: DiscountAllocationsEntity[] | null;
}
export interface DestinationLocationOrOriginLocation {
  id: number;
  country_code: string;
  province_code: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
}
export interface DiscountAllocationsEntity {
  amount: string;
  amount_set: ShopPresentedMoney;
  discount_application_index: number;
}
export interface PaymentDetails {
  credit_card_bin: string;
  avs_result_code?: any;
  cvv_result_code?: any;
  credit_card_number: string;
  credit_card_company: string;
}
export interface ShippingLinesEntity {
  id: number;
  carrier_identifier?: any;
  code: string;
  delivery_category?: any;
  discounted_price: string;
  discounted_price_set: ShopPresentedMoney;
  phone?: any;
  price: string;
  price_set: ShopPresentedMoney;
  requested_fulfillment_service_id?: any;
  source: string;
  title: string;
  tax_lines?: TaxLinesEntity[] | null;
  discount_allocations?: null[] | null;
}
