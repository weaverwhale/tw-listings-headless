import { FeatureFlagConfigValue } from "./FeatureFlagConfigValue";

export type FeatureFlagCombinationConfig = {
  combinationFunction: (
    values: FeatureFlagConfigValue[]
  ) => FeatureFlagConfigValue;
  defaultValue: FeatureFlagConfigValue;
};
