/**
 * @description Type that represents POJO - Plain Old Javascript Object.
 * Takes a generic T, depending on the level of type safety desired.
 */
export type PlainObject<T = unknown> = Record<string, T>;
