import { FeatureFlagConfigValue } from '../../../types';
import { isFeatureFlagRankedControlListValue } from '../checkers';

export function assertValidConfigValue(value: unknown): asserts value is FeatureFlagConfigValue {
  if (typeof value === 'number') return;
  if (typeof value === 'boolean') return;
  if (typeof value === 'object' && Array.isArray(value)) {
    if (value.every((val) => typeof val === 'string')) return;
    if (value.every((val) => isFeatureFlagRankedControlListValue(val))) return;
  }

  throw new TypeError(
    `Invalid FeatureFlagConfigValue - ${value} isn't a valid FeatureFlagConfigValue`
  );
}
