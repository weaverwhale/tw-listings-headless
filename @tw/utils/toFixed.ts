/**
 * Same as Number.toFixed but returns number instead of string
 * @param num the number to fixed
 * @param places places to fix
 * @returns {number} the fixed number
 */
export function toFixed(num: number, places = 2): number {
  const factor = Math.pow(10, places);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}
