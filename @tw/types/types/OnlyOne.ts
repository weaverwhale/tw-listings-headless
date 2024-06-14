export type OnlyOne<T extends Record<string, any>> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, undefined>>;
}[keyof T];
