function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function mapCamelToSnake<SrcType, DestType extends Record<string, any>>(
  obj: SrcType
): DestType {
  const result: Partial<DestType> = {};
  Object.keys(obj).forEach((key) => {
    const value = (obj as any)[key];
    if (value !== undefined) {
      const snakeKey = camelToSnake(key);
      (result as any)[snakeKey] = value;
    }
  });
  return result as DestType;
}
