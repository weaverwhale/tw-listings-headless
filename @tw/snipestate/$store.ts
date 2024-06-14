import { useEffect, useState } from 'react';
import { Observable, ObservableParams, isObservableParams } from './classes/Observable';
import { NonFunction, Store } from './types';

/**
 * @description
 * Creates a global store.
 * Just a more functional/React-y wrapper around the Observable class.
 *
 * Exposes the following methods:
 * - `get`: Get the current observed value.
 * - `set`: Sets the value - updating any entity listening to the value's changes.
 * - `subscribe`: Method used to subscribe to changes in the store from anywhere.
 *    Returns an `unsubscribe` method that can be called to remove the subscription and stop listening for changes.
 * - `useStore`: Hook used to listen to the value's changes. Returns value and setter for the value.
 * - `useDerived`: Convenience hook that can be used like useSelector - with the store's data.
 */
export function $store<T extends NonFunction<unknown>>(
  value: T | Observable<T> | ObservableParams<T>
): Store<T> {
  const observable = (() => {
    if (value instanceof Observable) return value;
    if (isObservableParams(value)) return new Observable(value);
    return new Observable<T>({ initialData: value });
  })();

  //
  // INIT
  //
  // useful to track previous value
  let prevVal = observable.data;
  // MUST call `set` once on initialization of store to make sure all side effects are in sync
  set(observable.data);

  //
  // UTILS
  //
  function get() {
    return observable.data;
  }

  function set(newValue: T | ((prev: T) => T)) {
    const computedVal =
      typeof newValue === 'function' ? (newValue as (prev: T) => T)(observable.data) : newValue;

    prevVal = observable.data;
    observable.setData(computedVal);
  }

  function subscribe(cb: (newVal: T, prevVal: T) => T): () => void {
    const func = (newVal: T) => cb(newVal, prevVal);
    observable.addUpdateListener(func);
    return () => observable.removeUpdateListener(func);
  }

  function eagerSubscribe(cb: (newVal: T, prevVal: T, unsubscribe: () => void) => T): () => void {
    // This function needs a callback that can receive an unsubscribe in its signature.
    // Otherwise, it's impossible to unsubscribe on the first run of func if desired.

    function func(newVal: T) {
      return cb(newVal, prevVal, unsubscribe);
    }

    function unsubscribe() {
      observable.removeUpdateListener(func);
    }

    observable.addUpdateListener(func);

    // immediate first call
    func(observable.data);

    return unsubscribe;
  }

  function useStore(): [T, typeof set] {
    const [val, setVal] = useState<T>(observable.data);

    useEffect(() => {
      const listener = (newVal: T) => setVal(newVal);

      observable.addUpdateListener(listener);

      return () => {
        observable.removeUpdateListener(listener);
      };
    }, []);

    return [val, set];
  }

  function useDerived<D = any>(cb: (val: T) => D): D {
    const [val, setVal] = useState<D>(cb(observable.data));

    useEffect(() => {
      const listener = (newVal: T) => setVal(cb(newVal));

      observable.addUpdateListener(listener);

      return () => {
        observable.removeUpdateListener(listener);
      };
    }, [cb]);

    return val;
  }

  return {
    get,
    set,
    subscribe,
    eagerSubscribe,
    useStore,
    useDerived,
  };
}
