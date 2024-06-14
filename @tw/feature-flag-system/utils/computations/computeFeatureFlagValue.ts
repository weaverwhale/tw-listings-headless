import {
  FeatureFlag,
  FeatureFlagMetaData,
  FeatureFlagPackagesConfig,
  FeatureFlagConfigValue,
  FeatureFlagConfigKey,
  PackageMetaData,
  FeatureFlagValueSource,
  NullableFeatureFlagValueWithMetaData,
} from '../../types';
import { comboMethodConfig } from '../../constants';

type PackageMetaDataMap = { [confKey: FeatureFlagConfigKey]: PackageMetaData };

export const computeFeatureFlagValue = (
  featureFlagId: FeatureFlag,
  ffMetadata: Partial<FeatureFlagMetaData>,
  ffPackagesConfig: FeatureFlagPackagesConfig,
  ffPackagesMetadata: PackageMetaData[]
): NullableFeatureFlagValueWithMetaData => {
  const metadata = ffMetadata[featureFlagId];
  if (!metadata) {
    return {
      value: null,
      metadata: {},
    };
  }

  const comboConfig = comboMethodConfig[metadata.combinationMethod];
  const packageMetaDataMap = ffPackagesMetadata.reduce(
    (acc, pm) => ((acc[pm.id] = pm), acc),
    {} as PackageMetaDataMap
  );

  let highestConfigRank = 0,
    ffConfigValues: FeatureFlagConfigValue[] = [],
    highestSources = new Set<FeatureFlagValueSource>();

  for (const plan in ffPackagesConfig) {
    const planKey = plan as FeatureFlagConfigKey;
    const planConfig = ffPackagesConfig[planKey];

    // only deal with configs that have a value for this feature flag
    const ffConfig = planConfig[featureFlagId];
    if (!ffConfig) continue;

    const { rank = 0, sources = [] } = packageMetaDataMap[planKey] || {};
    if (highestConfigRank && rank < highestConfigRank) continue;

    if (rank === highestConfigRank) {
      ffConfigValues.push(ffConfig.value);
      sources.forEach((source) => highestSources.add(source));
      continue;
    }

    highestConfigRank = rank;
    highestSources = new Set(sources);
    ffConfigValues = [ffConfig.value];
  }

  const value = !ffConfigValues.length
    ? metadata.defaultValue ?? comboConfig.defaultValue
    : comboConfig.combinationFunction(ffConfigValues);

  return {
    value,
    metadata: {
      sources: [...highestSources],
    },
  };
};
