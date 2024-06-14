import { FeatureFlag } from './FeatureFlag';
import { FeatureFlagValueWithMetaData } from './FeatureFlagValueWithMetaData';

export type FeatureFlagValueWithMetaDataMap = {
  [key in FeatureFlag]?: FeatureFlagValueWithMetaData;
};
