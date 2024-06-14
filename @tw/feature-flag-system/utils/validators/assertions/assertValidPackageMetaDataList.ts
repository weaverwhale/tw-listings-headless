import { PackageMetaData } from "../../../types";
import { assertValidPackageMetaData } from "./assertValidPackageMetaData";

export function assertValidPackageMetaDataList(
  list: unknown
): asserts list is PackageMetaData[] {
  if (!Array.isArray(list)) {
    throw new TypeError("Invalid PackageMetaData[]: list must be an array");
  }

  for (const metadata of list) {
    assertValidPackageMetaData(metadata);
  }
}
