import { FeatureFlagConfigKey } from "../types";

// plans with higher numbers have higher rankings
export const PACKAGE_CONFIG_RANKS: Readonly<
  Record<FeatureFlagConfigKey, number>
> = {
  CONF_FREE: 0,
  CONF_BASIC: 0,
  CONF_A: 1,
  CONF_B: 2,
  CONF_C: 3,
};
