import { FeatureFlag, FeatureFlagDiffValueMap } from '@tw/feature-flag-system/module/types';
import { logger } from '../logger';
import { Request, Response } from '../express';

type FFDiffValue = FeatureFlagDiffValueMap[FeatureFlag];
type FFChangeHandler = (shopId: string, diffValue: FFDiffValue) => Promise<any>;
type FFChangeHandlerMap = Partial<Record<FeatureFlag, FFChangeHandler>>;
type FFChangedDTO = { shopId: string; featureFlagDiffMap: FeatureFlagDiffValueMap };

/**
 * @description Each time a shop changes its plan or gets an addon, a pubsub is emitted from the subscription manager
 * with an object of type `FeatureFlagDiffValueMap`.  Multiple services listen to this pub sub and run their changes
 * based on that object.  This function takes in a map of feature flags and their corresponding `FFChangeHandler`
 * callbacks.  If one of the updated feature flags from the diff exists in the provided map, the callback for that
 * feature flag will be run.  Otherwise, it's ignored.
 */
export const getFFChangePubSubHandler =
  (featureFlagHandlerMap: FFChangeHandlerMap) => async (req: Request, res: Response) => {
    const { shopId, featureFlagDiffMap }: FFChangedDTO = req.body.data;
    logger.info('featureFlagChanged', { shopId, featureFlagDiffMap });

    try {
      const changes = Object.keys(featureFlagHandlerMap).map((featureFlag: FeatureFlag) => {
        // ignore if featureFlag doesn't exist in diff map or is undefined
        if (!featureFlagDiffMap[featureFlag]) return;

        const diffValue = featureFlagDiffMap[featureFlag];
        const changeHandler = featureFlagHandlerMap[featureFlag];
        return changeHandler(shopId, diffValue);
      });

      await Promise.all(changes);
    } catch (err) {
      // This is just extra precaution - errors should be handled in the provided callbacks.
      logger.error('Error in ff change pubsub handler:>>', err.message, err);
    } finally {
      return res.send();
    }
  };
