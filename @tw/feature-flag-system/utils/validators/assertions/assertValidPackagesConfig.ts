import { FeatureFlag, FeatureFlagPackagesConfig } from "../../../types";
import { assertValidFeatureFlagConfigKey } from "./assertValidFeatureFlagConfigKey";
import { assertValidConfigValue } from "./assertValidConfigValue";

function hasField<T extends Record<string, any>, K extends string>(
  obj: T,
  field: K
): obj is T & { [P in K]: T[P] } {
  return field in obj;
}

export function assertValidPackagesConfig(
  config: unknown
): asserts config is FeatureFlagPackagesConfig {
  if (!config || typeof config !== "object") {
    throw new TypeError("Invalid config - config must be an object");
  }

  Object.keys(config).forEach((plan) => {
    assertValidFeatureFlagConfigKey(plan);
    if (!hasField(config, plan)) return;

    const packageConfig: any = config[plan];
    if (typeof packageConfig !== "object" || packageConfig === null) {
      throw new Error(
        `Package config for package "${plan}" must be a non-null object`
      );
    }

    for (const featureFlag in packageConfig) {
      if (!(featureFlag in FeatureFlag)) continue;

      const { value } = packageConfig[featureFlag];
      assertValidConfigValue(value);
    }
  });
}
