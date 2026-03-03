/**
 * Async control flow helpers: retry, timeout, sleep, debounceAsync, throttleAsync, memoizeAsync, sequence, parallel.
 * @internal
 */

import { Ok, Err, type Result } from '../result.js';

// ============================================================================
// PROMISE UTILITIES
// ============================================================================

/**
 * Retries an async function with exponential backoff.
 * Returns `Result<T, Error>` — never throws.
 *
 * @example
 * const result = await retry(3, 1000)(fetchData); // 3 attempts, 1s base delay
 * if (!result.ok) console.error(result.error.message);
 */
export const retry =
  <T>(maxAttempts: number, delayMs: number = 1000, backoff: number = 2) =>
  async (fn: () => Promise<T>): Promise<Result<T, Error>> => {
    let lastError: Error = new Error('no attempts made');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const value = await fn();
        return Ok(value);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoff, attempt - 1);
          await sleep(delay);
        }
      }
    }

    return Err(lastError);
  };

/**
 * Races a promise against a timeout, rejecting if the deadline is exceeded.
 *
 * @example
 * const slowFetch = async () => fetch('/slow-endpoint');
 * await timeout(5000)(slowFetch()); // rejects if it takes more than 5s
 */
export const timeout =
  <T>(ms: number) =>
  async (promise: Promise<T>): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeoutPromise]);
  };

/**
 * Resolves after a given number of milliseconds.
 *
 * @example
 * await sleep(1000); // waits 1 second
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Returns a debounced version of an async function.
 * Only executes after the specified delay has elapsed since the last call.
 *
 * @example
 * const saveData = debounceAsync(500)(async (data: string) => {
 *   await api.save(data);
 * });
 *
 * // Only the last call within 500ms will execute
 * saveData('a');
 * saveData('b');
 * saveData('c'); // only this one runs
 */
export const debounceAsync =
  <T extends unknown[], R>(delayMs: number) =>
  (fn: (...args: T) => Promise<R>) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let latestResolve: ((value: R) => void) | null = null;
    let latestReject: ((error: unknown) => void) | null = null;

    return (...args: T): Promise<R> => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return new Promise<R>((resolve, reject) => {
        latestResolve = resolve;
        latestReject = reject;

        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            latestResolve?.(result);
          } catch (error) {
            latestReject?.(error);
          }
        }, delayMs);
      });
    };
  };

/**
 * Returns a throttled version of an async function.
 * At most one execution per delay window; subsequent calls within the window
 * return the pending promise from the active execution.
 *
 * @example
 * const logEvent = throttleAsync(1000)(async (event: string) => {
 *   await api.log(event);
 * });
 *
 * // At most 1 call per second
 * logEvent('click'); // executes
 * logEvent('click'); // returns same promise
 */
export const throttleAsync =
  <T extends unknown[], R>(delayMs: number) =>
  (fn: (...args: T) => Promise<R>) => {
    let lastExecution = 0;
    let pending: Promise<R> | null = null;

    return async (...args: T): Promise<R> => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecution;

      if (timeSinceLastExecution >= delayMs) {
        lastExecution = now;
        pending = fn(...args);
        return pending;
      }

      if (pending) {
        return pending;
      }

      pending = fn(...args);
      return pending;
    };
  };

/**
 * Memoizes an async function. Returns `Result<T, Error>` — never rethrows.
 * Cached results are returned on subsequent calls with the same arguments.
 *
 * @example
 * const fetchUser = memoizeAsync(async (id: string) => api.getUser(id));
 *
 * const r1 = await fetchUser('123'); // network call -> Ok(user)
 * const r2 = await fetchUser('123'); // cached       -> Ok(user)
 */
export const memoizeAsync = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args)
) => {
  const cache = new Map<string, R>();

  return async (...args: T): Promise<Result<R, Error>> => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return Ok(cache.get(key)!);
    }

    try {
      const result = await fn(...args);
      cache.set(key, result);
      return Ok(result);
    } catch (err) {
      return Err(err instanceof Error ? err : new Error(String(err)));
    }
  };
};

/**
 * Executes an array of async thunks sequentially, collecting results.
 *
 * @example
 * const tasks = [
 *   async () => 'task 1 done',
 *   async () => 'task 2 done',
 * ];
 * await sequence(tasks); // ['task 1 done', 'task 2 done']
 */
export const sequence = async <T>(fns: Array<() => Promise<T>>): Promise<T[]> => {
  const results: T[] = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
};

/**
 * Executes an array of async thunks in parallel, collecting results.
 *
 * @example
 * const tasks = [
 *   async () => fetchUser('1'),
 *   async () => fetchUser('2'),
 *   async () => fetchUser('3'),
 * ];
 * await parallel(tasks);
 */
export const parallel = async <T>(fns: Array<() => Promise<T>>): Promise<T[]> =>
  Promise.all(fns.map(fn => fn()));
