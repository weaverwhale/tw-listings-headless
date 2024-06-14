import { FeatureFlagValueType, FeatureFlagCombinationMethod } from "../types";

export const validCombos: {
  [key in FeatureFlagValueType]: Set<FeatureFlagCombinationMethod>;
} = {
  [FeatureFlagValueType.AllowList]: new Set([
    FeatureFlagCombinationMethod.ARRAY_CONCAT,
    FeatureFlagCombinationMethod.ARRAY_INTERSECT,
  ]),
  [FeatureFlagValueType.BlockList]: new Set([
    FeatureFlagCombinationMethod.ARRAY_CONCAT,
    FeatureFlagCombinationMethod.ARRAY_INTERSECT,
  ]),
  [FeatureFlagValueType.Boolean]: new Set([
    FeatureFlagCombinationMethod.AND,
    FeatureFlagCombinationMethod.OR,
  ]),
  [FeatureFlagValueType.Number]: new Set([
    FeatureFlagCombinationMethod.SUM,
    FeatureFlagCombinationMethod.MAX,
    FeatureFlagCombinationMethod.MIN,
  ]),
  [FeatureFlagValueType.RankedControlList]: new Set([
    FeatureFlagCombinationMethod.ARRAY_COMBINE_BY_RANK
  ]),
};
