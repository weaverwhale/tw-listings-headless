import { FeatureFlag } from './FeatureFlag';
import { FeatureFlagConfigValue } from './FeatureFlagConfigValue';

export type FeatureFlagValueMap = {
  [key in FeatureFlag]?: FeatureFlagConfigValue;
};
