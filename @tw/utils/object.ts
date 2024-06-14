export function merge<OutputType = any>(...objects: any[]): OutputType {
  const result = {};
  for (const object of objects) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        if (typeof value === 'object') {
          result[key] = merge(result[key], value);
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result as OutputType;
}

export function definedKeys(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc.push(key);
    }
    return acc;
  }, []);
}

export function nonEmptyKeys(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      acc.push(key);
    }
    return acc;
  }, []);
}
