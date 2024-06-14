import { Store, StoreReturnTypes } from './types';

export function isPromise(x: unknown): x is Promise<unknown> {
  // Apparently this is the best way to check if something is a Promise 🤷‍♂️ - JS is weird bruh
  // https://stackoverflow.com/questions/27746304/how-to-check-if-an-object-is-a-promise#answer-27746324
  return !!x && typeof x === 'object' && 'then' in x && typeof x.then === 'function';
}

/** Extracts all values from an array of stores and returns a new array of their current values */
export function getValues<S extends Store[]>(stores: [...S]) {
  return stores.map((s) => s.get()) as StoreReturnTypes<S>;
}
