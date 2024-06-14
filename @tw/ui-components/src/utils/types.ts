export type NonFunction<T> = T extends Function ? never : T;

export type Store<T = any> = {
  /** Retrieve the value of the observed data */
  get: () => T;
  /** Set value of observed data on a global scope - everyone using the useStore or useDerived hooks is notified */
  set: (val: NonFunction<T> | ((prev: T) => T)) => void;
  /** Lets us subscribe to changes from the store. When an update occurs, the callback function is run. Returns an "unsubscribe" function to stop listening to updates. */
  subscribe: (cb: (newVal: T, prevVal: T) => any) => () => void;
  /** Hook that lets you listen to changes in the observed data and set the data globaly - use like useState */
  useStore: () => [T, Store<T>['set']];
  /** More of a convenience hook if you need to use some derived value from the store's current data - use like useSelector */
  useDerived: <D>(cb: (val: T) => D) => D;
};

export type StoreReturnTypes<S extends Store[]> = {
  [I in keyof S]: S[I] extends Store<infer U> ? U : never;
};
