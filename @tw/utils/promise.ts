import * as clock from './clock';

export async function allLimit<Input = any, Result = any>(
  limit: number,
  inputs: Input[] | Generator<Input>,
  mapFn?: (arg: Input) => Promise<Result>,
  options: {
    timeoutMs?: number; // per promise
    timeoutError?: Error;
    totalTimeoutMs?: number; // for all Promises
    totalTimeoutError?: Error;
    requireSuccess?: boolean; // if one promise rejects, stop all and throw - DEFAULT FALSE!
  } = {}
): Promise<Result[]> {
  let results = [];
  let iterator: Iterable<[number, Input]> = (function* () {
    let index = 0;
    for (let input of inputs) {
      yield [index++, input];
    }
  })();
  let error: Error = null;
  async function workerProcess(
    iterable: Iterable<[number, Input | Promise<Result>]>,
    workerId: number
  ): Promise<void> {
    try {
      if (iterable !== iterator) {
        throw new Error('iterable mismatch');
      }
      for (let [index, input] of iterable) {
        if (error) {
          break;
        }
        let promise: Promise<Result>;
        try {
          if (typeof mapFn === 'function') {
            promise = mapFn(input as Input);
          } else {
            promise = input as Promise<Result>;
          }
          results[index] = await (options.timeoutMs
            ? timeout(options.timeoutMs, promise, options.timeoutError)
            : promise);
        } catch (e) {
          if (options.requireSuccess) {
            error = e instanceof Error ? e : new Error(e);
            break;
          }
          results[index] = e;
        }
      }
    } catch (e) {
      e.message = `promiseAllLimit worker ${workerId} failed: ${e.message}`;
      throw e;
    }
  }

  const concurrency = Array(limit)
    .fill(iterator)
    .map((iterable, worker) => workerProcess(iterable, worker));
  const done = Promise.allSettled(concurrency);
  await (options.totalTimeoutMs
    ? timeout(options.totalTimeoutMs, done, options.totalTimeoutError)
    : done);
  if (error) {
    throw error;
  }
  return results;
}

export async function timeout<T = any>(
  timeoutMs: number,
  promise: Promise<T>,
  timeoutError?: Error
): Promise<T> {
  let timeout: NodeJS.Timeout;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeout = setTimeout(
        () => reject(timeoutError || new Error(`promise timeout after ${timeoutMs} ms`)),
        timeoutMs
      );
    }),
  ]).then((result: T) => {
    clearTimeout(timeout);
    return result;
  });
}

export async function allObject(
  object: Record<string, Promise<any> | any>
): Promise<Record<string, any>> {
  let results: Record<string, any> = {};
  for (let [key, promise] of Object.entries(object)) {
    try {
      results[key] = await promise;
    } catch (e) {
      results[key] = e;
    }
  }
  return results;
}

export async function chain<R = any>(
  promiseFactories:
    | [...((args: any | undefined) => Promise<any>)[], (args: any | undefined) => Promise<R>]
    | Generator<any, Promise<R>, unknown>
    | AsyncGenerator<any, R, unknown>
): Promise<R> {
  try {
    let result: Awaited<any>;
    for await (let factory of promiseFactories) {
      if (typeof factory === 'function') {
        result = await factory(result);
      } else {
        result = (await factory) as Promise<any | R>;
      }
    }
    return result;
  } catch (e) {
    e.message = `chain failed: ${e.message}`;
    throw e;
  }
}

export async function serial<Input = any, Result = any>(
  inputs: Input[] | Generator<Input>,
  mapFn?: (arg: Input) => Promise<Result>,
  options: {
    timeoutMs?: number; // per promise
    timeoutError?: Error;
    totalTimeoutMs?: number; // for all Promises
    totalTimeoutError?: Error;
    requireSuccess?: boolean; // if one promise rejects, stop all and throw - DEFAULT FALSE!
  } = {}
): Promise<any[]> {
  let results = [];
  let iterator: Iterable<[number, Input]> = (function* () {
    let index = 0;
    for (let input of inputs) {
      yield [index++, input];
    }
  })();
  async function _serialLoop() {
    try {
      for (let [index, input] of iterator) {
        let promise: Promise<Result>;
        try {
          if (typeof mapFn === 'function') {
            promise = mapFn(input as Input);
          } else {
            promise = input as Promise<Result>;
          }
          results[index] = await (options.timeoutMs
            ? timeout(options.timeoutMs, promise, options.timeoutError)
            : promise);
        } catch (e) {
          if (options.requireSuccess) {
            let error = e instanceof Error ? e : new Error(e);
            throw error;
          }
          results[index] = e;
        }
      }
    } catch (e) {
      e.message = `promise.serial failed: ${e.message}`;
      throw e;
    }
  }
  const done = _serialLoop().catch((e) => {
    throw e;
  });
  await (options.totalTimeoutMs
    ? timeout(options.totalTimeoutMs, done, options.totalTimeoutError)
    : done);
  return results;
}

export class Waiter<T = void> {
  private promise: Promise<T>;
  private _resolve: (args: T | PromiseLike<T>) => void;
  private _reject: (e: Error) => void;
  private interval: NodeJS.Timeout;

  constructor(
    options: {
      condition?: () => any | null;
      timeoutMs?: number;
    } = {}
  ) {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.interval = setInterval(() => {
      if (options.condition) {
        const result = options.condition();
        if (result) {
          this.continue(result);
        }
      }
    }, 1000);
  }

  continue(args: T | PromiseLike<T>) {
    clearInterval(this.interval);
    this._resolve(args);
  }

  done() {
    return this.promise;
  }
}
