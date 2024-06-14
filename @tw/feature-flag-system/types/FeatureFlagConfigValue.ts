import { FeatureFlagRankedControlListValue } from './FeatureFlagRankedControlListValue';

export type FeatureFlagConfigValue =
  | boolean
  | number
  | string[]
  | FeatureFlagRankedControlListValue[];
