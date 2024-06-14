import { isPromise } from '../utils';

type CallQueueFunction = () => void | Promise<void> | (() => any);

/**
 * Contains a queue to which functions can be added and executed in order - even if they're asynchronous.
 *
 * IMPORTANT: If there's an error in a callback added to the queue, the queue is cleared and execution stops.
 */
export class OrderedTaskQueue {
  private running = false;
  private callQueue: CallQueueFunction[] = [];
  private cleanupFunc: (() => any) | null = null;

  /**
   * Does nothing if a function is currently getting executed.
   * Otherwise, removes and calls the first function in the callback queue.
   */
  private async flush(): Promise<void> {
    if (this.running) return;

    const firstFunc = this.callQueue.shift();
    if (!firstFunc) return;

    this.running = true;

    try {
      this.cleanup();

      const res = firstFunc();
      if (isPromise(res)) await res;

      // save cleanup function to be run before next callback
      if (typeof res === 'function') this.cleanupFunc = res;
    } catch (err) {
      console.error('Error caught in snipestate queue:>>', err);

      // clear queue if we have an error
      this.clear();
    }

    // Setting running to false is what allows us to move
    // to the next function in the queue if one exists.
    this.running = false;
    this.flush();
  }

  /**
   * Adds the callback to the queue and immediately attempts to execute.
   */
  public add(cb: CallQueueFunction): void {
    this.callQueue.push(cb);
    this.flush();
  }

  /**
   * Clear the task queue. Can't stop a currently running task, but
   * no further tasks will be executed.
   */
  public clear(): void {
    this.callQueue = [];
  }

  /**
   * runs cleanupFunc and clears after finish, since
   * not all callbacks might return a cleanup function
   *
   * Must catch all to be non blocking
   */
  public cleanup(): void {
    try {
      this.cleanupFunc?.();
    } catch (err) {
      // TODO: Create some global setting that can allow devs to see snipestate errors in dev mode only
    } finally {
      this.cleanupFunc = null;
    }
  }
}
