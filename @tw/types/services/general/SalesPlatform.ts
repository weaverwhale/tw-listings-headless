export type SalesPlatform = 'shopify' | 'bigcommerce' | 'woocommerce' | 'stripe';

export const salesPlatformDisplayName: { [key in SalesPlatform]: string } = {
  shopify: 'Shopify',
  bigcommerce: 'BigCommerce',
  woocommerce: 'WooCommerce',
  stripe: 'Stripe'
}
