import { FeatureFlagValueSource } from '../types';

export const featureFlagValueSources = new Set<FeatureFlagValueSource>([
  'subscription',
  'shop',
  'user',
]);
