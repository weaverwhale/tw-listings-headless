import { FeatureFlagBlockingMethod } from "../../../types";

export function assertValidBlockingMethod(
  method: unknown
): asserts method is FeatureFlagBlockingMethod {
  if (typeof method !== "string") {
    throw new TypeError("Invalid FeatureFlagBlockingMethod - must be a string");
  }

  if (!(method in FeatureFlagBlockingMethod)) {
    throw new TypeError(
      `Invalid FeatureFlagBlockingMethod - ${method} isn't a FeatureFlagBlockingMethod`
    );
  }
}
