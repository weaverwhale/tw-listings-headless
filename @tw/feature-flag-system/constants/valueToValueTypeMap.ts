import { FeatureFlagValueType, FeatureFlagRankedControlListValue } from '../types';
import { isFeatureFlagRankedControlListValue } from '../utils';

export type ValidValueMap = {
  [FeatureFlagValueType.AllowList]: string[];
  [FeatureFlagValueType.BlockList]: string[];
  [FeatureFlagValueType.RankedControlList]: FeatureFlagRankedControlListValue[];
  [FeatureFlagValueType.Boolean]: boolean;
  [FeatureFlagValueType.Number]: number;
};

export type ValidationFunction<K extends FeatureFlagValueType> = (
  val: unknown
) => val is ValidValueMap[K];

export const valueToValueTypeMap: {
  [K in FeatureFlagValueType]: ValidationFunction<K>;
} = {
  [FeatureFlagValueType.AllowList]: (val): val is string[] => {
    if (!Array.isArray(val)) return false;
    return val.every((val) => typeof val === 'string');
  },
  [FeatureFlagValueType.BlockList]: (val): val is string[] => {
    if (!Array.isArray(val)) return false;
    return val.every((val) => typeof val === 'string');
  },
  [FeatureFlagValueType.Boolean]: (val): val is boolean => {
    return typeof val === 'boolean';
  },
  [FeatureFlagValueType.Number]: (val): val is number => {
    return typeof val === 'number';
  },
  [FeatureFlagValueType.RankedControlList]: (val): val is FeatureFlagRankedControlListValue[] => {
    if (!Array.isArray(val)) return false;
    return val.every((val) => isFeatureFlagRankedControlListValue(val));
  },
};
