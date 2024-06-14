import { OrderedTaskQueue } from './classes';
import { EffectCallback, Store } from './types';
import { getValues } from './utils';

/**
 * Very similar to `$effect` - just doesn't run the provided callback initially.
 * Only runs the callback if any stores emit an update.
 */
export function $lazyEffect<S extends Store[], TCallback extends EffectCallback<S>>(
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
      // must get the values at the exact time the function
      // is called, so we get the right values for that call
      const values = getValues(stores);
      taskQueue.add(() => cb(unsub, ...values));
    })
  );

  return unsub;
}
