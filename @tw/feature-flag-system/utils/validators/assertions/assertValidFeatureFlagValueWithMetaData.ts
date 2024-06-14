import { FeatureFlagConfigValue, FeatureFlagValueWithMetaData } from '../../../types';
import { assertHasKeys } from './assertHasKeys';
import { assertValidConfigValue } from './assertValidConfigValue';
import { assertValidFeatureFlagValueSource } from './assertValidFeatureFlagValueSource';
import { assertValidPOJO } from './assertValidPOJO';

type Mode = 'partial' | 'complete';
type FeatureFlagValueOrNullWithMetaData = FeatureFlagValueWithMetaData & {
  value: FeatureFlagConfigValue | null;
};

export function assertValidFeatureFlagValueWithMetaData<M extends Mode>(
  obj: unknown,
  mode: M
): asserts obj is M extends 'complete'
  ? FeatureFlagValueWithMetaData
  : FeatureFlagValueOrNullWithMetaData {
  assertValidPOJO(obj, 'FeatureFlagValueWithMetaData');
  assertHasKeys('FeatureFlagValueWithMetaData', obj, ['value', 'metadata']);

  if (!(mode === 'partial' && obj.value === null)) {
    assertValidConfigValue(obj.value);
  }

  assertValidPOJO(obj.metadata, 'FeatureFlagValueWithMetaData[metadata]');

  if ('sources' in obj.metadata) {
    if (!Array.isArray(obj.metadata.sources)) {
      throw new TypeError(
        'Invalid FeatureFlagValueWithMetaData[metadata][sources]:>> "sources" must be an array'
      );
    }

    for (const source of obj.metadata.sources) {
      assertValidFeatureFlagValueSource(source);
    }
  }
}
