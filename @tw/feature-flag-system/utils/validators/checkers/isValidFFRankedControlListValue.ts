import { FeatureFlagRankedControlListValue } from '../../../types';

export const isFeatureFlagRankedControlListValue = (
  v: unknown
): v is FeatureFlagRankedControlListValue => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;

  if (!('type' in v && 'rank' in v && 'id' in v)) return false;

  if (!v.id) return false; // id must be non empty

  return (v.type === 'allow' || v.type === 'block') && typeof v.rank === 'number';
};
