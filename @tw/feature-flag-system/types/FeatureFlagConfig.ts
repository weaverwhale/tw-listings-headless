import { FeatureFlag } from "./FeatureFlag";
import { FeatureFlagConfigValue } from "./FeatureFlagConfigValue";

export type FeatureFlagConfig = {
  [key in FeatureFlag]?: {
    value: FeatureFlagConfigValue;
    [key: string]: any;
  };
};
