import { ServicesIds } from '../services';
import { ShopIntegrationProperties } from '../types/ShopProviders';

export const SENSORY_SUPPORTED_PROVIDERS: ServicesIds[] = [
  'recharge',
  'shipstation',
  'shipbob',
  'smsbump',
  'criteo',
  'bing',
  'taboola',
  'outbrain',
  'mountain',
  'gorgias',
  'klaviyo',
  'okendo',
];
export const SENSORY_IGNORE_PROVIDERS: ServicesIds[] = ['shopify', 'klaviyo', 'bing'];

export type SensorySummaryRequest = {
  providerId: ServicesIds;
  start: string;
  end: string;
  integrations: ShopIntegrationProperties[];
};
