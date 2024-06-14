function isObject(item: any) {
  if (item?.__pulumiOutput) return false;
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Recursively merges the properties of multiple source objects into a target object.
 * @param target - The target object to merge the sources into.
 * @param sources - The source objects to merge into the target object.
 * @returns The merged object.
 */
export function deepMerge(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key]) && (Array.isArray(target[key]) || !target[key])) {
        if (!target[key]) Object.assign(target, { [key]: [] });
        target[key] = target[key].concat(source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}
