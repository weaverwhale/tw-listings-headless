import { FeatureFlagConfigKey } from "../../types";
import { PACKAGE_CONFIG_RANKS, CONFIG_KEY_PREFIX } from "../../constants";

export const computePackageConfigKeys = (
  ffConfigKeys: (string | null)[]
): FeatureFlagConfigKey[] => {
  return ffConfigKeys
    .filter(
      (key): key is FeatureFlagConfigKey =>
        !!key?.startsWith(CONFIG_KEY_PREFIX)
    )
    .sort((a, b) => {
      if (!(a in PACKAGE_CONFIG_RANKS)) return -1;
      if (!(b in PACKAGE_CONFIG_RANKS)) return -1;
      return PACKAGE_CONFIG_RANKS[a] - PACKAGE_CONFIG_RANKS[b];
    });
};
