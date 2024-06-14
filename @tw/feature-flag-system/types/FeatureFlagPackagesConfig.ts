import { FeatureFlagConfig } from "./FeatureFlagConfig";
import { FeatureFlagConfigKey } from "./FeatureFlagConfigKey";

export type FeatureFlagPackagesConfig = {
  [plan: FeatureFlagConfigKey]: FeatureFlagConfig;
};
