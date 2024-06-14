import { PackageMetaData } from '../../../types';
import { assertValidFeatureFlagConfigKey } from './assertValidFeatureFlagConfigKey';
import { assertValidFeatureFlagValueSource } from './assertValidFeatureFlagValueSource';

export function assertValidPackageMetaData(metadata: unknown): asserts metadata is PackageMetaData {
  if (!metadata) {
    throw new TypeError('Invalid PackageMetaData: metadata must be defined.');
  }

  if (typeof metadata !== 'object') {
    throw new TypeError('Invalid PackageMetaData: metadata must be an object.');
  }

  if (!('id' in metadata)) {
    throw new TypeError('Invalid PackageMetaData: missing field "id"');
  }

  if (!('name' in metadata)) {
    throw new TypeError('Invalid PackageMetaData: missing field "name"');
  }

  if ('rank' in metadata && typeof metadata.rank !== 'number') {
    throw new TypeError('Invalid PackageMetaData: rank must be a number');
  }

  if ('isPackage' in metadata && typeof metadata.isPackage !== 'boolean') {
    throw new TypeError('Invalid PackageMetaData: isPackage must be a boolean');
  }

  if ('sources' in metadata) {
    if (!Array.isArray(metadata.sources)) {
      throw new TypeError('Invalid PackageMetaData: sources must be an array');
    }

    for (const source of metadata.sources) {
      assertValidFeatureFlagValueSource(source);
    }
  }

  assertValidFeatureFlagConfigKey(metadata.id);

  if (typeof metadata.name !== 'string') {
    throw new TypeError(
      `Invalid PackageMetaData - ${metadata.name}: metadata value must be of type "string"`
    );
  }
}
