import { FeatureFlagConfigKey } from './FeatureFlagConfigKey';
import { FeatureFlagValueSource } from './FeatureFlagValueSource';

/**
 * Due to different specs when ff system was made, this type was called PackageMetaData,
 * but it should be called `ConfigMetaData`.  Not all feature flag configs are for packages.
 * "Package" implies a product in stripe.
 * // TODO: This type needs to be renamed, and we need to refactor/rename a bunch of places.
 */
export type PackageMetaData = {
  id: FeatureFlagConfigKey;
  name: string;
  rank?: number;
  description?: string;
  sources?: FeatureFlagValueSource[];
  /** Determines if this config is a stripe product or not */
  isPackage?: boolean;
};
