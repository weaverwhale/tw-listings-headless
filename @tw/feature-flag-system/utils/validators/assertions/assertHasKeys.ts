export function assertHasKeys<T extends object, K extends string>(
  objName: string,
  obj: T,
  fields: K[]
): asserts obj is T & { [P in K]: P extends keyof T ? T[P] : unknown } {
  const missingKeys: string[] = [];

  for (const field of fields) {
    if (!(field in obj)) {
      missingKeys.push(field);
    }
  }

  if (missingKeys.length) {
    throw new Error(`Invalid ${objName} - missing fields: "${missingKeys.join()}"`);
  }
}
