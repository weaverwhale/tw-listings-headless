import { FeatureFlagCombinationMethod } from './FeatureFlagCombinationMethod';
import { FeatureFlag } from './FeatureFlag';
import { FeatureFlagBlockingMethod } from './FeatureFlagBlockingMethod';
import { FeatureFlagValueType } from './FeatureFlagValueType';
import { FeatureFlagConfigValue } from './FeatureFlagConfigValue';

export type FeatureFlagMetaData = {
  [key in FeatureFlag]: {
    description: string;
    ffKey: FeatureFlag;
    valueType: FeatureFlagValueType;
    combinationMethod: FeatureFlagCombinationMethod;
    blockingMethod: FeatureFlagBlockingMethod;
    defaultValue?: FeatureFlagConfigValue;
    deprecated?: boolean;
    blockingText?: string;
    unblockText?: string;
    [key: string]: any;
  };
};
