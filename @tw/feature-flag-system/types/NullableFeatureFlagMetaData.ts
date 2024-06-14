import { FeatureFlag } from "./FeatureFlag";
import { FeatureFlagMetaData } from "./FeatureFlagMetaData";

type Nullable<T> = { [K in keyof T]: T[K] | null };

export type NullableFeatureFlagMetaData = Nullable<FeatureFlagMetaData[FeatureFlag]>