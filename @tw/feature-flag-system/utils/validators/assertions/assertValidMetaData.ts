import { FeatureFlag, FeatureFlagMetaData } from '../../../types';
import { validCombos, valueToValueTypeMap } from '../../../constants';
import { assertValidCombinationMethod } from './assertValidCombinationMethod';
import { assertValidFeatureFlagValueType } from './assertValidFeatureFlagValueType';
import { assertValidBlockingMethod } from './assertValidBlockingMethod';
import { assertHasKeys } from './assertHasKeys';

export function assertValidMetadata(
  metadata: unknown
): asserts metadata is Partial<FeatureFlagMetaData> {
  if (!metadata || typeof metadata !== 'object') {
    throw new TypeError('Invalid metadata - metadata must be an object');
  }

  const metadataKeys = Object.keys(metadata).filter(
    (key): key is FeatureFlag => key in FeatureFlag
  );

  metadataKeys.forEach((key) => {
    type UnresolveFeatureFlagMetaData = { [K in FeatureFlag]?: object };
    const ffMetadata = (metadata as UnresolveFeatureFlagMetaData)[key];
    if (!ffMetadata) return;

    // check that we have required fields
    assertHasKeys('metadata', ffMetadata, [
      'ffKey',
      'valueType',
      'combinationMethod',
      'description',
      'blockingMethod',
    ]);

    const { valueType, combinationMethod, description, blockingMethod, ffKey } = ffMetadata;

    if (typeof ffKey !== 'string' || !(ffKey in FeatureFlag)) {
      throw new TypeError(`Invalid metadata: field "ffKey" isn't a valid FeatureFlag`);
    }

    if (typeof description !== 'string') {
      throw new TypeError('Invalid metadata: field "description" must be a string');
    }

    if ('blockingText' in ffMetadata && typeof ffMetadata.blockingText !== 'string') {
      throw new TypeError('Invalid metadata: field "blockingText" must be a string if provided');
    }

    assertValidBlockingMethod(blockingMethod);
    assertValidFeatureFlagValueType(valueType);
    assertValidCombinationMethod(combinationMethod);

    if (!validCombos[valueType].has(combinationMethod)) {
      throw new Error(
        `metadata provided is invalid - combination method ${combinationMethod} 
        isn't compatible with type ${valueType}`
      );
    }

    if ('defaultValue' in ffMetadata && !valueToValueTypeMap[valueType](ffMetadata.defaultValue)) {
      throw new Error(
        `defaultValue for metadata provided is invalid - valueType ${valueType} 
        isn't compatible with value ${ffMetadata.defaultValue}`
      );
    }
  });
}
