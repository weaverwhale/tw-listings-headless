import { FeatureFlagValueType } from "../../../types";

export function assertValidFeatureFlagValueType(
  valType: unknown
): asserts valType is FeatureFlagValueType {
  if (
    typeof valType !== "string" ||
    valType in FeatureFlagValueType === false
  ) {
    throw new TypeError(
      `Invalid FeatureFlagValueType - ${valType} isn't a valid FeatureFlagValueType`
    );
  }
}
