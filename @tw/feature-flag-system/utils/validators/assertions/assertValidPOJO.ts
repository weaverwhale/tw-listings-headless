import { PlainObject } from '../../../types';

/**
 * @description Asserts that an input is a POJO - Plain Old Javascript Object
 * @param obj - The object to check.
 * @param objectName - Optional parameter to allow for more descriptive error messages, in
 * order to specify for what type this check is coming from.
 */
export function assertValidPOJO(obj: unknown, objectName?: string): asserts obj is PlainObject {
  if (typeof obj !== 'object' || !obj || Array.isArray(obj)) {
    throw new TypeError(`Invalid ${objectName || 'POJO'}: must be non-null/non-array object`);
  }
}
