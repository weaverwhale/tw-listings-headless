import { $store } from './$store';
import { NonFunction, Store, StoreReturnTypes } from './types';
import { getValues, isPromise } from './utils';
import { CallbackDebouncer, PromisifiedData } from './classes';

/**
 * @description Creates a store with all the methods of `$store`
 * by receiving a callback that takes in the values of the stores as
 * arguments and returns some computed value using those arguments, as
 * well as an array of stores that this store will depend on.
 *
 * This function returns either a store containing the type of the return
 * type of the provided callback or a store containing a "promisified" version
 * of the initial data if the return type of the callback is a Promise. This
 * wrapped version is of type `PromisifiedData`.
 *
 * The values in the callback match the order of the stores that are in the
 * array.
 */
export function $derived<
  S extends Store[],
  TCallback extends (...args: StoreReturnTypes<S>) => unknown | Promise<unknown>,
  TData = ReturnType<TCallback> extends Promise<unknown>
    ? PromisifiedData<Awaited<ReturnType<TCallback>>>
    : ReturnType<TCallback>,
  TReturned = TData extends Promise<TData> ? PromisifiedData<TData> : TData
>(cb: TCallback, stores: [...S]): Store<TReturned> {
  const initialValue = cb(...getValues(stores));

  if (isPromise(initialValue)) {
    return createDerivedFromAsync(
      initialValue,
      cb as (...args: StoreReturnTypes<S>) => Promise<TData>,
      stores
    ) as unknown as Store<TReturned>;
  }

  return createDefaultDerived(
    initialValue,
    cb as (...args: StoreReturnTypes<S>) => TData,
    stores
  ) as unknown as Store<TReturned>;
}

/** Creates the underlying store for a regular derived value and sets the necessary subscriptions */
function createDefaultDerived<T, S extends Store[]>(
  initialValue: T,
  cb: (...args: StoreReturnTypes<S>) => T,
  stores: [...S]
): Store<T> {
  const store = $store<T>(initialValue);

  for (const s of stores) {
    s.subscribe(() => {
      const data = cb(...getValues(stores));
      if (data === store.get()) return;

      store.set(data as NonFunction<T>);
    });
  }

  return store;
}

/**
 * Same as `createDefaultDerived`, BUT dealing with an asyc operation. Has automatic batching to only
 * take the latest update, since the callback run for a subscription from another store or a newer
 * update from the same store could have newer data.
 */
function createDerivedFromAsync<T, S extends Store[]>(
  initialValue: Promise<T>,
  cb: (...args: StoreReturnTypes<S>) => Promise<T>,
  stores: [...S]
): Store<PromisifiedData<T>> {
  const store = $store(new PromisifiedData<T>());
  const debouncer = new CallbackDebouncer();

  const func = async (promise?: Promise<T>) => {
    // reset store - loading state and clear error. only data doesn't change
    store.set(new PromisifiedData<T>({ data: store.get().data }));

    const val = new PromisifiedData<T>({ data: store.get().data });

    try {
      val.data = await (promise || cb(...getValues(stores)));
    } catch (err) {
      val.error = err;
    } finally {
      val.pending = false;
      store.set(val);
    }
  };

  // initial computation
  debouncer.handle(() => func(initialValue));

  for (const s of stores) {
    s.subscribe(() => debouncer.handle(func));
  }

  return store;
}
