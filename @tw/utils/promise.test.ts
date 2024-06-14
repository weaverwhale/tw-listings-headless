import * as twPromise from './promise';

jest.useFakeTimers();
beforeEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

describe('promiseAllLimit', () => {
  it('takes a limit, array, and mapFn and returns a promise', async () => {
    const call = async () =>
      await twPromise.allLimit(1, [1, 2, 3], (a) => new Promise((resolve) => resolve(a)));
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
  });
  it('promise resolves with array of results', async () => {
    const call = async () =>
      await twPromise.allLimit(1, [1, 2, 3], (a) => new Promise((resolve) => resolve(a * 2)));
    expect(await call()).toEqual([2, 4, 6]);
  });
  it('takes a limit and generator, and returns a promise that resolves into an array of results', async () => {
    const call = async () =>
      await twPromise.allLimit(
        1,
        (function* () {
          yield 1;
          yield 2;
          yield 3;
        })()
      );
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
    expect(await call()).toEqual([1, 2, 3]);
  });
  it("doesn't run more than <limit> promises in parallel", async () => {
    let count = 0;
    const limit = 3;
    const inputs = Array(10).fill(0);
    let i = 0;
    const call = async () =>
      await twPromise.allLimit<number, number>(4, inputs, () => {
        i++;
        if (++count > limit) {
          throw new Error('too many promises running');
        }
        return new Promise((resolve) => {
          count--;
          resolve(i);
        });
      });
    expect(await call()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('if any of the promises reject, returns rejected value', async () => {
    const call = async () =>
      await twPromise.allLimit(1, [1, 2, 3], (a) => {
        if (a === 2) {
          return Promise.reject('The soup is cold');
        }
        return new Promise((resolve) => resolve(a));
      });
    expect((await call())[1]).toEqual('The soup is cold');
  });
  it('timeoutMs for each promise', async () => {
    const call = async () => {
      let result = twPromise.allLimit(
        3,
        [1, 2, 3],
        async (a) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return Promise.resolve(a);
        },
        { timeoutMs: 100 }
      );
      jest.advanceTimersByTime(100);
      return await result;
    };
    expect((await call())[0]).toEqual(new Error('promise timeout after 100 ms'));
  });
  it('timeoutMs accepts custom timeoutError', async () => {
    const call = async () => {
      let result = twPromise.allLimit(
        3,
        [1, 2, 3],
        async (a) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return Promise.resolve(a);
        },
        { timeoutMs: 100, timeoutError: new Error('custom timeout error') }
      );
      jest.advanceTimersByTime(100);
      return await result;
    };
    expect((await call())[0]).toEqual(new Error('custom timeout error'));
  });
  it('totalTimeoutMs for all promises', async () => {
    const call = async () => {
      return await twPromise.allLimit(
        2,
        [1, 2, 3, 4],
        (a) => {
          jest.advanceTimersByTime(199);
          return new Promise((resolve) => resolve(a));
        },
        { totalTimeoutMs: 300 }
      );
    };
    await expect(call()).rejects.toThrow('promise timeout after 300 ms');
  });
  it('totalTimeoutMs accepts custom totalTimeoutError', async () => {
    const call = async () => {
      return await twPromise.allLimit(
        2,
        [1, 2, 3, 4],
        (a) => {
          jest.advanceTimersByTime(200);
          return new Promise((resolve) => resolve(a));
        },
        { totalTimeoutMs: 300, totalTimeoutError: new Error('custom total timeout error') }
      );
    };
    await expect(call()).rejects.toThrow('custom total timeout error');
  });
  it('requireSuccess stops creation of new promises and throws', async () => {
    let counter = 0;
    const call = async () => {
      return await twPromise.allLimit(
        2,
        [1, 2, 3, 4, 5, 6, 7, 8],
        (a) => {
          counter++;
          if (a === 3) {
            throw new Error('The soup is cold');
          }
          return Promise.resolve(a);
        },
        { requireSuccess: true }
      );
    };
    await expect(call()).rejects.toThrow('The soup is cold');
    expect(counter).toEqual(3);
  });
});

describe('promiseTimeout', () => {
  it('takes a timeout, promise, and optional timeoutError and returns a promise', async () => {
    const call = async () => await twPromise.timeout(100, Promise.resolve(1));
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
  });
  it('promise resolves with result of promise', async () => {
    const call = async () => await twPromise.timeout(100, Promise.resolve(1));
    expect(await call()).toEqual(1);
  });
  it('promise rejects with timeoutError if promise takes longer than timeout', async () => {
    const call = async () => {
      let result = await twPromise.timeout(100, new Promise(() => {}));
      jest.advanceTimersByTime(101);
      return result;
    };
    expect(call()).rejects.toThrow('promise timeout after 100 ms');
  });
  it('promise rejects with custom error if passed', async () => {
    const call = async () => {
      let result = await twPromise.timeout(100, new Promise(() => {}), new Error('custom error'));
      jest.advanceTimersByTime(101);
      return result;
    };
    expect(call()).rejects.toThrow('custom error');
  });
});

describe('chain', () => {
  // actual use case:
  it('resolves with result of last function', async () => {
    const call = async () =>
      await twPromise.chain([
        async () => 1,
        async (a: number): Promise<string> => '' + (a + 1),
        async (b: string): Promise<number> => +b + 1,
        async (c: number): Promise<string> => '' + (c + 1),
      ]);
    expect(await call()).toEqual('4');
  });

  it('takes an array of functions and returns a promise', async () => {
    const call = async () => await twPromise.chain([() => Promise.resolve(1)]);
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
  });
  it('generator', async () => {
    const call = async () =>
      await twPromise.chain<number>(
        (function* (howMany: number) {
          let count = 0;
          for (let i = 0; i < howMany; i++) {
            yield (count = count + 1);
          }
          return Promise.resolve(count);
        })(5)
      );
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
    expect(await call()).toEqual(5);
  });
  it('async generator', async () => {
    const call = async () =>
      await twPromise.chain<number>(
        (async function* (howMany: number) {
          let count = 0;
          for (let i = 0; i < howMany; i++) {
            yield (count = await Promise.resolve(count + 1));
          }
          return count;
        })(5)
      );
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
    expect(await call()).toEqual(5);
  });
  it('rejects with error if any function rejects', async () => {
    const call = async () =>
      await twPromise.chain([
        () => Promise.resolve(1),
        () => Promise.reject('The soup is cold'),
        () => Promise.resolve(3),
      ]);
    await expect(call).rejects.toThrow('The soup is cold');
  });
});

describe('serial', () => {
  it('takes an array and mapFn and returns a promise', async () => {
    const call = async () =>
      await twPromise.serial([1, 2, 3], (a) => new Promise((resolve) => resolve(a)));
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
  });
  it('promise resolves with array of results', async () => {
    const call = async () =>
      await twPromise.serial([1, 2, 3], (a) => new Promise((resolve) => resolve(a * 2)));
    expect(await call()).toEqual([2, 4, 6]);
  });
  it('takes a generator and returns a promise that resolves into an array of results', async () => {
    const call = async () =>
      await twPromise.serial(
        (function* () {
          yield 1;
          yield 2;
          yield 3;
        })()
      );
    expect(() => call()).not.toThrow();
    expect(call()).toEqual(expect.any(Promise));
    expect(await call()).toEqual([1, 2, 3]);
  });
  it("doesn't run more than one promise in parallel", async () => {
    let count = 0;
    const limit = 1;
    const inputs = Array(10).fill(0);
    let i = 0;
    const call = async () =>
      await twPromise.serial<number, number>(inputs, () => {
        i++;
        if (++count > limit) {
          throw new Error('too many promises running');
        }
        return new Promise((resolve) => {
          count--;
          resolve(i);
        });
      });
    expect(await call()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('if any of the promises reject, returns rejected value', async () => {
    const call = async () =>
      await twPromise.serial([1, 2, 3], (a) => {
        if (a === 2) {
          return Promise.reject('The soup is cold');
        }
        return new Promise((resolve) => resolve(a));
      });
    expect((await call())[1]).toEqual('The soup is cold');
  });
  it('timeoutMs for each promise', async () => {
    const call = async () => {
      let result = twPromise.serial(
        [1, 2, 3],
        async (a) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return Promise.resolve(a);
        },
        { timeoutMs: 100, requireSuccess: true }
      );
      jest.advanceTimersByTime(100);
      return await result;
    };
    expect(() => call()).rejects.toEqual(
      new Error('promise.serial failed: promise timeout after 100 ms')
    );
  });
  it('timeoutMs accepts custom timeoutError', async () => {
    const call = async () => {
      let result = twPromise.serial(
        [1, 2, 3],
        async (a) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return Promise.resolve(a);
        },
        { timeoutMs: 100, timeoutError: new Error('custom timeout error'), requireSuccess: true }
      );
      jest.advanceTimersByTime(101);
      return await result;
    };
    expect(() => call()).rejects.toEqual(new Error('promise.serial failed: custom timeout error'));
  });
  it('totalTimeoutMs for all promises', async () => {
    const call = async () => {
      return await twPromise.serial(
        [1, 2, 3, 4],
        (a) => {
          jest.advanceTimersByTime(199);
          return new Promise((resolve) => resolve(a));
        },
        { totalTimeoutMs: 300 }
      );
    };
    await expect(call()).rejects.toThrow('promise timeout after 300 ms');
  });
  it('totalTimeoutMs accepts custom totalTimeoutError', async () => {
    const call = async () => {
      return await twPromise.serial(
        [1, 2, 3, 4],
        (a) => {
          jest.advanceTimersByTime(200);
          return new Promise((resolve) => resolve(a));
        },
        { totalTimeoutMs: 300, totalTimeoutError: new Error('custom total timeout error') }
      );
    };
    await expect(call()).rejects.toThrow('custom total timeout error');
  });
  it('requireSuccess stops creation of new promises and throws', async () => {
    let counter = 0;
    const call = async () => {
      return await twPromise.serial(
        [1, 2, 3, 4, 5, 6, 7, 8],
        (a) => {
          counter++;
          if (a === 3) {
            throw new Error('The soup is cold');
          }
          return Promise.resolve(a);
        },
        { requireSuccess: true }
      );
    };
    await expect(call()).rejects.toThrow('The soup is cold');
    expect(counter).toEqual(3);
  });
});

describe('Waiter', () => {
  it('waiter.done() is a Promise', async () => {
    const waiter = new twPromise.Waiter();
    expect(waiter.done()).toEqual(expect.any(Promise));
  });
  it('waiter.done() resolves when waiter.continue() is called', async () => {
    const spy = jest.fn();
    const waiter = new twPromise.Waiter();
    const done = waiter.done();
    done.then(spy);
    expect(done).toEqual(expect.any(Promise));
    await Promise.resolve(); // let any promise callbacks run
    expect(spy).not.toHaveBeenCalled();
    waiter.continue();
    await Promise.resolve(); // let any promise callbacks run
    expect(spy).toHaveBeenCalled();
  });
  it('waiter.done() resolves when waiter.continue() is called with a value', async () => {
    const spy = jest.fn();
    const waiter = new twPromise.Waiter<string>();
    const done = waiter.done();
    done.then(spy);
    waiter.continue('The soup is cold');
    await Promise.resolve(); // let any promise callbacks run
    expect(spy).toHaveBeenCalledWith('The soup is cold');
  });
});
