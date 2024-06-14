import { FeatureFlagConfigValue } from './FeatureFlagConfigValue';
import { FeatureFlagValueWithMetaData } from './FeatureFlagValueWithMetaData';

export type NullableFeatureFlagValueWithMetaData = Omit<FeatureFlagValueWithMetaData, 'value'> & {
  value: FeatureFlagConfigValue | null;
};
