export function objectBool(obj: any) {
  return Boolean(Object.keys(obj || {}).length);
}
