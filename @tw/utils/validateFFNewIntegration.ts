import { FeatureFlag, FeatureFlagResultProperties } from '@tw/feature-flag-system/module/types';
import { logger } from './logger';
import { ServicesIds } from '@tw/types/module/services';
import { callServiceEndpoint } from './callServiceEndpoint';

export async function validateFFNewIntegration(
  shopId: string,
  serviceId: ServicesIds
): Promise<boolean> {
  try {
    const {
      data: { rankedControlList: serviceList },
    } = await callServiceEndpoint<FeatureFlagResultProperties>(
      'subscription-manager',
      `features/feature-flag-config/${shopId}/${FeatureFlag.LIMIT_INTEGRATIONS_FF}`,
      null,
      { method: 'GET' }
    );
    if (serviceList?.find((service) => service.id === serviceId)?.type === 'block') {
      throw new Error('Integration is blocked in this plan');
    }
    return true;
  } catch (err) {
    logger.error('Error in checkFFBeforeIntegration', err);
    return false;
  }
}
