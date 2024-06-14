import { isPromise } from '../utils';

export class CallbackDebouncer {
  private running = false;
  private currentFunc: Function | null = null;
  private waitingFunc: Function | null = null;

  /** Get the function that should be run now */
  private getFunc(): Function | null {
    try {
      return this.currentFunc || this.waitingFunc;
    } finally {
      // after getting the most current function,
      // either we'll have the waiting function
      // in currentFunc, and waitingFunc will be null.
      // or both will be null
      this.currentFunc = this.waitingFunc;
      this.waitingFunc = null;
    }
  }

  /**
   * Does nothing if a function is currently getting execute,
   * Otherwise, calls the last saved function.
   */
  private async flush(): Promise<void> {
    if (this.running) return;

    const func = this.getFunc();
    if (!func) return; // nothing to call

    this.running = true;

    try {
      const res = func();
      if (isPromise(res)) await res;
    } catch (err) {
      console.error('Error caught in snipestate debouncer:>>', err);

      // nothing else should happen after an error - clearing all functions
      this.currentFunc = null;
      this.waitingFunc = null;
    }

    this.running = false;
    this.flush();
  }

  /**
   * Sets the callback to the queue and immediately attempts to execute.
   */
  public handle(cb: Function): void {
    this.waitingFunc = cb;
    this.flush();
  }
}
