import { FeatureFlag } from "../../../types";

export function assertValidFeatureFlag(ff: unknown): asserts ff is FeatureFlag {
  if (typeof ff === "string" && ff in FeatureFlag) return;
  throw new TypeError(`Invalid FeatureFlag - ${ff} isn't a valid FeatureFlag`);
}
