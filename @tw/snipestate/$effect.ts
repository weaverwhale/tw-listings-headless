import { OrderedTaskQueue } from './classes';
import { EffectCallback, Store } from './types';
import { getValues } from './utils';

/**
 * Runs the provided callback whenever any of the subscribed-to stores emit an update.
 * `$effect` also does an initial run of the callback right when its called.
 *
 * It returns an "off" function to turn off the effect/remove subscriptions.
 *
 * One important thing is that if the callback is asynchronous, the taskQueue will
 * automatically make sure it's being called in order.  If you don't want this kind of
 * sequential execution, don't make the callback return a Promise.
 */
export function $effect<S extends Store[], TCallback extends EffectCallback<S>>(
  cb: TCallback,
  stores: [...S]
): () => void {
  const taskQueue = new OrderedTaskQueue();

  const unsub = () => {
    // must clear the task queue, so no further tasks will be executed after an unsub
    taskQueue.clear();
    unsubs.forEach((u) => u());
  };

  const unsubs = stores.map((s) =>
    s.subscribe(() => {
      // same as initialVals for same reason
      const values = getValues(stores);
      taskQueue.add(() => cb(unsub, ...values));
    })
  );

  // must get the values at the exact time the function
  // is called, so we get the right values for that call
  const initialVals = getValues(stores);

  // initial run
  taskQueue.add(() => cb(unsub, ...initialVals));

  return unsub;
}
