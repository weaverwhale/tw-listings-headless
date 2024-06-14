export type OnlyStringKeys<R extends any, K extends keyof R = keyof R> = K extends string
  ? K
  : never;
