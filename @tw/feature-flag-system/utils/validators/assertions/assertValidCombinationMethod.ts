import { FeatureFlagCombinationMethod } from "../../../types";

export function assertValidCombinationMethod(
  comboMethod: unknown
): asserts comboMethod is FeatureFlagCombinationMethod {
  if (
    typeof comboMethod !== "string" ||
    comboMethod in FeatureFlagCombinationMethod === false
  ) {
    throw new TypeError(
      `Invalid FeatureFlagCombinationMethod - ${comboMethod} isn't a valid FeatureFlagCombinationMethod`
    );
  }
}
