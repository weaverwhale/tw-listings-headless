import { FeatureFlag } from './FeatureFlag';
import { NullableFeatureFlagValueWithMetaData } from './NullableFeatureFlagValueWithMetaData';

export type NullableFeatureFlagValueWithMetaDataMap = {
  [key in FeatureFlag]?: NullableFeatureFlagValueWithMetaData;
};
