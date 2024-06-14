import { FeatureFlagValueSource } from './FeatureFlagValueSource';
import { FeatureFlagConfigValue } from './FeatureFlagConfigValue';

export type FeatureFlagValueWithMetaData = {
  value: FeatureFlagConfigValue;
  metadata: {
    sources?: FeatureFlagValueSource[];
  };
};
