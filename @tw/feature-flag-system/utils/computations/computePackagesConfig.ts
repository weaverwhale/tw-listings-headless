import {
  FeatureFlagPackagesConfig,
  FeatureFlagConfigKey,
} from "../../types";
import { computePackageConfigKeys } from "./computePackageConfigKeys";

export const computePackagesConfig = (
  ffAllPackagesConfig: FeatureFlagPackagesConfig,
  subFeatureKeys: (string | null)[]
): FeatureFlagPackagesConfig => {
  const packageConfigKeys = computePackageConfigKeys(subFeatureKeys);

  const keys = Object.keys(
    ffAllPackagesConfig
  ) as FeatureFlagConfigKey[];

  return keys.reduce((acc, key) => {
    if (!packageConfigKeys.includes(key)) return acc;
    acc[key] = ffAllPackagesConfig[key];
    return acc;
  }, {} as FeatureFlagPackagesConfig);
};
