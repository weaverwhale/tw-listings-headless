export interface ShopifyOrderForAttribution {
  id: number;
  shopCode: string;
  shopDomain: string;
  app_id: number;
  client_details: ClientDetails;
  created_at: string;
  cogs: number;
  currency: string;
  customer: Customer;
  discount_codes?: any[] | any;
  landing_site: string;
  landing_site_ref: string;
  line_items?: LineItemsEntity[] | null;
  order_status_url: string;
  name: string;
  payment_gateway_names?: string[] | null;
  referring_site: string;
  shipping_address: ShopifyBillingAddress;
  source_name: string;
  tags: string;
  total_price: string;
}

interface ClientDetails {
  user_agent: string;
  browser_ip: string;
}

interface ShopifyBillingAddress {
  zip: string;
  city: string;
  country_code: string;
  province_code: string;
}

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: any;
}

interface LineItemsEntity {
  id: number;
  gift_card: boolean;
  name: string;
  price: string;
  product_id: number;
  quantity: number;
  tax_code: string;
  title: string;
  total_discount: string;
  variant_id: number;
}
