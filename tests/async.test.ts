import { describe, it, expect, vi } from 'vitest';
import {
  pipeAsync,
  composeAsync,
  mapAsync, mapParallel, mapConcurrent,
  filterAsync, reduceAsync,
  retry, timeout, sleep,
  debounceAsync, throttleAsync,
  memoizeAsync,
  sequence, parallel,
} from '../src/async.js';
import { isOk, isErr } from '../src/result.js';

describe('pipeAsync', () => {
  it('pipes async functions left-to-right', async () => {
    const add2 = async (n: number) => n + 2;
    const mult3 = async (n: number) => n * 3;
    const result = await (pipeAsync as (f1: typeof add2, f2: typeof mult3) => (n: number) => Promise<number>)(add2, mult3)(5);
    expect(result).toBe(21); // (5+2)*3
  });
});

describe('mapAsync', () => {
  it('applies async function in sequence', async () => {
    const double = async (n: number) => n * 2;
    const result = await mapAsync(double)([1, 2, 3]);
    expect(result).toEqual([2, 4, 6]);
  });
});

describe('mapParallel', () => {
  it('applies async function in parallel', async () => {
    const double = async (n: number) => n * 2;
    const result = await mapParallel(double)([1, 2, 3]);
    expect(result).toEqual([2, 4, 6]);
  });
});

describe('mapConcurrent', () => {
  it('limits concurrency', async () => {
    const running: number[] = [];
    let maxConcurrent = 0;

    const task = async (n: number) => {
      running.push(n);
      maxConcurrent = Math.max(maxConcurrent, running.length);
      await sleep(10);
      running.splice(running.indexOf(n), 1);
      return n * 2;
    };

    const result = await mapConcurrent(2, task)([1, 2, 3, 4, 5]);
    expect(result).toEqual([2, 4, 6, 8, 10]);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});

describe('filterAsync', () => {
  it('filters with async predicate', async () => {
    const isEven = async (n: number) => n % 2 === 0;
    const result = await filterAsync(isEven)([1, 2, 3, 4, 5]);
    expect(result).toEqual([2, 4]);
  });
});

describe('reduceAsync', () => {
  it('reduces with async function', async () => {
    const sum = async (acc: number, n: number) => acc + n;
    const result = await reduceAsync(sum, 0)([1, 2, 3, 4, 5]);
    expect(result).toBe(15);
  });
});

describe('retry', () => {
  it('returns Ok on first success', async () => {
    const fn = vi.fn().mockResolvedValue(42);
    const result = await retry(3)(fn);
    expect(isOk(result)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    let attempts = 0;
    const fn = vi.fn(async () => {
      if (++attempts < 3) throw new Error('fail');
      return 'ok';
    });
    const result = await retry(3, 1)(fn);
    expect(isOk(result)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('returns Err after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    const result = await retry(3, 1)(fn);
    expect(isErr(result)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('timeout', () => {
  it('resolves if within time limit', async () => {
    const result = await timeout<string>(100)(Promise.resolve('fast'));
    expect(result).toBe('fast');
  });

  it('rejects if over time limit', async () => {
    const slow = new Promise(resolve => setTimeout(resolve, 200));
    await expect(timeout(50)(slow)).rejects.toThrow('Timeout');
  });
});

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(30);
    expect(Date.now() - start).toBeGreaterThanOrEqual(25);
  });
});

describe('memoizeAsync', () => {
  it('caches successful results', async () => {
    let calls = 0;
    const fn = memoizeAsync(async (n: number) => { calls++; return n * 2; });
    await fn(5);
    await fn(5);
    await fn(5);
    expect(calls).toBe(1);
    await fn(10);
    expect(calls).toBe(2);
  });

  it('returns Err on failure without caching', async () => {
    const fn = memoizeAsync(async (s: string) => JSON.parse(s));
    const r = await fn('bad json');
    expect(isErr(r)).toBe(true);
  });
});

describe('sequence', () => {
  it('executes tasks in order', async () => {
    const order: number[] = [];
    const tasks = [1, 2, 3].map(n => async () => { order.push(n); return n; });
    const results = await sequence(tasks);
    expect(results).toEqual([1, 2, 3]);
    expect(order).toEqual([1, 2, 3]);
  });
});

describe('parallel', () => {
  it('executes tasks concurrently', async () => {
    const tasks = [1, 2, 3].map(n => async () => n * 10);
    const results = await parallel(tasks);
    expect(results).toEqual([10, 20, 30]);
  });
});

describe('debounceAsync', () => {
  type NumFn = (n: number) => Promise<number>;

  it('only calls the function once for rapid successive calls', async () => {
    const inner = vi.fn(async (n: number) => n * 2);
    const debounced = debounceAsync<[number], number>(50)(inner as NumFn);

    debounced(1);
    debounced(2);
    const result = await debounced(3);

    expect(result).toBe(6);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledWith(3);
  });

  it('calls the function again after the delay has elapsed', async () => {
    const inner = vi.fn(async (n: number) => n * 2);
    const debounced = debounceAsync<[number], number>(30)(inner as NumFn);

    await debounced(1);
    await sleep(40);
    await debounced(2);

    expect(inner).toHaveBeenCalledTimes(2);
    expect(inner).toHaveBeenNthCalledWith(1, 1);
    expect(inner).toHaveBeenNthCalledWith(2, 2);
  });

  it('rejects when the underlying function throws', async () => {
    const inner = vi.fn(async (_n: number): Promise<number> => {
      throw new Error('debounce error');
    });
    const debounced = debounceAsync<[number], number>(10)(inner as NumFn);

    await expect(debounced(1)).rejects.toThrow('debounce error');
  });
});

describe('throttleAsync', () => {
  type NumFn = (n: number) => Promise<number>;

  it('executes immediately on first call', async () => {
    const inner = vi.fn(async (n: number) => n * 2);
    const throttled = throttleAsync<[number], number>(100)(inner as NumFn);

    const result = await throttled(5);

    expect(result).toBe(10);
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('returns the same promise for calls within the delay window', async () => {
    const inner = vi.fn(async (n: number) => n * 2);
    const throttled = throttleAsync<[number], number>(100)(inner as NumFn);

    const p1 = throttled(1);
    const p2 = throttled(2);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe(r2);
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('executes again after the delay has elapsed', async () => {
    const inner = vi.fn(async (n: number) => n * 2);
    const throttled = throttleAsync<[number], number>(30)(inner as NumFn);

    await throttled(1);
    await sleep(40);
    const result = await throttled(2);

    expect(result).toBe(4);
    expect(inner).toHaveBeenCalledTimes(2);
  });
});

describe('composeAsync', () => {
  it('composes two async functions right to left', async () => {
    const add1 = async (n: number) => n + 1;
    const double = async (n: number) => n * 2;
    // composeAsync(double, add1)(5) = double(add1(5)) = double(6) = 12
    const transform = composeAsync(
      double as (arg: unknown) => Promise<unknown>,
      add1 as (arg: unknown) => Promise<unknown>,
    );
    const result = await transform(5);
    expect(result).toBe(12);
  });

  it('composes three async functions right to left', async () => {
    const add1 = async (n: number) => n + 1;
    const double = async (n: number) => n * 2;
    const negate = async (n: number) => -n;
    // composeAsync(negate, double, add1)(3) = negate(double(add1(3))) = negate(double(4)) = negate(8) = -8
    const transform = composeAsync(
      negate as (arg: unknown) => Promise<unknown>,
      double as (arg: unknown) => Promise<unknown>,
      add1 as (arg: unknown) => Promise<unknown>,
    );
    const result = await transform(3);
    expect(result).toBe(-8);
  });

  it('passes the value through when given a single function', async () => {
    const double = async (n: number) => n * 2;
    const transform = composeAsync(double as (arg: unknown) => Promise<unknown>);
    const result = await transform(7);
    expect(result).toBe(14);
  });
});
