import { FeatureFlagConfigKey } from "../../../types";
import { CONFIG_KEY_PREFIX } from "../../../constants";

export function assertValidFeatureFlagConfigKey(
  key: unknown
): asserts key is FeatureFlagConfigKey {
  if (typeof key !== "string" || !key.startsWith(CONFIG_KEY_PREFIX)) {
    throw new TypeError(
      `Invalid FeatureFlagConfigKey - ${key} isn't a valid FeatureFlagConfigKey`
    );
  }
}
