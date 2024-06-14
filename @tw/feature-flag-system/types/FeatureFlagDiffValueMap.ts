import { FeatureFlag } from './FeatureFlag';
import { FeatureFlagConfigValue } from './FeatureFlagConfigValue';

export type FeatureFlagDiffValueMap = {
  [key in FeatureFlag]?: { old: FeatureFlagConfigValue; new: FeatureFlagConfigValue };
};