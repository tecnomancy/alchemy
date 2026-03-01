import { describe, it, expect, vi } from 'vitest';
import {
  pipeAsync,
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
