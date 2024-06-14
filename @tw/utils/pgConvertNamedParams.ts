type QueryReducerArray = [string, any[], number];
export function convertNamedParams(parameterizedSql: string, params: Record<string, any>) {
  const [text, values] = Object.entries(params).reduce(
    (acc, [key, value]) => {
      const [sql, array, index] = acc;
      if (!sql.includes(`:${key}`)) {
        return acc;
      }
      return [
        sql.replaceAll(`:${key}`, `$${index}`),
        [...array, value],
        index + 1,
      ] as QueryReducerArray;
    },
    [parameterizedSql, [], 1] as QueryReducerArray
  );
  return { text, values };
}
