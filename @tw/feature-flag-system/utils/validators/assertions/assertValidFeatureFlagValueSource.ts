import { featureFlagValueSources } from '../../../constants';
import { FeatureFlagValueSource } from '../../../types';

export function assertValidFeatureFlagValueSource(
  source: unknown
): asserts source is FeatureFlagValueSource {
  if (typeof source !== 'string') {
    throw new TypeError(`Invalid FeatureFlagValueSource: ${source} isn't a string.`);
  }

  // Just using the "as any" to make ts quiet.  We have to check source this way.
  if (!featureFlagValueSources.has(source as any)) {
    throw new TypeError(`Invalid FeatureFlagValueSource: ${source} isn't in the predefined list.`);
  }
}
