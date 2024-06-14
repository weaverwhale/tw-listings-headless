import { FeatureFlagConfigKey } from "../../../types";
import { CONFIG_KEY_PREFIX } from "../../../constants";

export function isValidFeatureFlagConfigKey(
  key: unknown
): key is FeatureFlagConfigKey {
  return typeof key === "string" && key.startsWith(CONFIG_KEY_PREFIX);
}
