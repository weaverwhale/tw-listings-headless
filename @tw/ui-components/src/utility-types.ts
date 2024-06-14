/**
 * @desc Give you a range of numbers from F up to and not including T
 */
export type NumRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * @desc Pick all keys from object or string union `T` that start with `Pattern`
 */
export type PickStartsWith<T, Pattern extends string> = T extends object
  ? {
      [K in keyof T as K extends `${Pattern}${string}` ? K : never]: T[K];
    }
  : T extends `${Pattern}${string}`
  ? T
  : never;

/**
 * @desc Pick all keys from object or string union `T` that end with `Pattern`
 */
export type PickEndsWith<T, Pattern extends string> = T extends object
  ? {
      [K in keyof T as K extends `${string}${Pattern}` ? K : never]: T[K];
    }
  : T extends `${string}${Pattern}`
  ? T
  : never;

/**
 * @desc Pick all keys from object or string union `T` that contain `Pattern`
 */
export type PickIncludes<T, Pattern extends string> = T extends object
  ? {
      [K in keyof T as K extends `${string}${Pattern}${string}` ? K : never]: T[K];
    }
  : T extends `${string}${Pattern}${string}`
  ? T
  : never;

/**
 * @desc Opposite of `NonNullable`
 */
export type Nullable<T> = T | null;

/**
 * @desc Make all keys and sub-keys of all objects in `T` nullable
 */
export type DeepNullable<T extends object> = Nullable<{
  [K in keyof T]: T[K] extends object ? Nullable<DeepNullable<T[K]>> : Nullable<T[K]>;
}>;

/**
 * @desc Make all keys and sub-keys of all objects in `T` partial/optional
 */
export type DeepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * @desc Make all keys and sub-keys of all objects in `T` required
 */
export type DeepRequired<T extends object> = Required<{
  [K in keyof T]: T[K] extends object ? DeepRequired<T[K]> : Required<T[K]>;
}>;

/**
 * @desc Used to get the type of functional or class components if their props types
 * aren't available.
 */
export type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
  ? Props
  : TComponent extends React.Component<infer Props>
  ? Props
  : never;

/**
 * @desc Used to define an array of a fixed length
 */
export type Tuple<T, Size extends number> = _Tuple<T, Size>;
type _Tuple<T, Size extends number, R extends T[] = []> = R['length'] extends Size
  ? R
  : _Tuple<T, Size, [T, ...R]>;

/**
 * @desc Helps make a type for a constructor with specific constraints.
 */
export type GConstructor<T = {}> = new (...args: any[]) => T;

/**
 * @desc Utility type "function".  Takes the first type, and overrides with the types of the keys in the second type.
 * It's sort of like taking the type of a library, omitting keys whose types you want to replace, and overriding them
 * with a different type **all in one line**.  This allows us to not have to declare new types when we don't want to.
 */
export type Override<T, R extends Partial<Record<keyof T, unknown>>> = {
  [K in keyof T]: K extends keyof R ? R[K] : T[K];
};

/**
 * @desc Allows us to take readonly types and make them not readonly
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * @desc Allows you to make specific fields writeable in the base type if they're readonly.
 */
export type WithWriteable<T extends object, K extends keyof T> = Prettify<
  Omit<T, K> & Writeable<Pick<T, K>>
>;

/**
 * @desc Sometimes a type can be a bit vague and hard to understand, especially if it's composed of multiple types.
 * Wrapping any type in this type allows us to see at first glance what fields are allowed/not allowed in the type
 * we're dealing with.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * @desc Allows you to require specific fields in the base type if they're not required.
 */
export type WithRequired<T extends object, K extends keyof T> = Prettify<T & Required<Pick<T, K>>>;

/**
 * @desc Allows you to unrequire specific fields in the base type if they're required.
 */
export type WithPartial<T extends object, K extends keyof T> = Prettify<
  Omit<T, K> & Partial<Pick<T, K>>
>;
