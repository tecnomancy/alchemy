/**
 * Async array transformation helpers: mapAsync, mapParallel, mapConcurrent, filterAsync, reduceAsync,
 * mapConcurrentResult, mapAsyncResult, reduceAsyncResult.
 * @internal
 */

import { isOk, Ok, Err, type Result } from '../result.js';

// ============================================================================
// ASYNC ARRAY TRANSFORMATIONS
// ============================================================================

/**
 * Applies an async function to each element sequentially (curried, data-last).
 *
 * @example
 * const fetchUserDetails = async (id: string) => ({ id, name: 'Alice' });
 * await mapAsync(fetchUserDetails)(['1', '2', '3']);
 */
export const mapAsync =
  <T, R>(fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> => {
    const results: R[] = [];
    for (const item of arr) {
      results.push(await fn(item));
    }
    return results;
  };

/**
 * Applies an async function to all elements in parallel (curried, data-last).
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: 'Alice' });
 * await mapParallel(fetchUser)(['1', '2', '3']);
 */
export const mapParallel =
  <T, R>(fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> =>
    Promise.all(arr.map(fn));

/**
 * Applies an async function with a concurrency limit (curried, data-last).
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: 'Alice' });
 * // Processes 5 at a time
 * await mapConcurrent(5, fetchUser)(['1', '2', '3', '4', '5', '6']);
 */
export const mapConcurrent =
  <T, R>(concurrency: number, fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> => {
    const results: R[] = new Array(arr.length);
    const executing = new Set<Promise<void>>();

    for (const [index, item] of arr.entries()) {
      const promise: Promise<void> = fn(item).then(result => {
        results[index] = result;
        executing.delete(promise);
      });

      executing.add(promise);

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  };

/**
 * Filters an array using an async predicate sequentially (curried, data-last).
 *
 * @example
 * const isActive = async (user: { id: string }) => {
 *   const status = await fetchStatus(user.id);
 *   return status === 'active';
 * };
 * await filterAsync(isActive)(users);
 */
export const filterAsync =
  <T>(predicate: (item: T) => Promise<boolean>) =>
  async (arr: T[]): Promise<T[]> => {
    const results: T[] = [];
    for (const item of arr) {
      if (await predicate(item)) {
        results.push(item);
      }
    }
    return results;
  };

/**
 * Reduces an array with an async reducer sequentially (curried, data-last).
 *
 * @example
 * const sumBalances = async (acc: number, user: { id: string }) => {
 *   const balance = await fetchBalance(user.id);
 *   return acc + balance;
 * };
 * await reduceAsync(sumBalances, 0)(users);
 */
export const reduceAsync =
  <T, R>(fn: (acc: R, item: T) => Promise<R>, initial: R) =>
  async (arr: T[]): Promise<R> => {
    let result = initial;
    for (const item of arr) {
      result = await fn(result, item);
    }
    return result;
  };

// ============================================================================
// RESULT-AWARE ASYNC OPERATIONS
// ============================================================================

/**
 * Maps over an array with a concurrency limit, collecting all `Result` values.
 * Runs at most `concurrency` items at a time (must be ≥ 1).
 *
 * Returns `Ok(values)` when every item succeeds, or `Err(errors)` with **all**
 * failures accumulated (does not short-circuit on first error).
 *
 * If `fn` rejects (throws) rather than returning `Err`, the rejection is caught
 * and stored as an error of type `unknown`. Prefer returning `Err` from `fn`.
 *
 * @example
 * // All succeed
 * const ok = await mapConcurrentResult(3, async (id) =>
 *   fetchUser(id)
 * )(['1', '2', '3']);
 * // Ok([user1, user2, user3])
 *
 * // Partial failures — all errors accumulated, none swallowed
 * const mixed = await mapConcurrentResult(3, async (id) => {
 *   const user = await fetchUser(id);
 *   return user ? Ok(user) : Err(`not found: ${id}`);
 * })(['1', 'bad', '3', 'missing']);
 * // Err(['not found: bad', 'not found: missing'])
 */
export const mapConcurrentResult =
  <T, B, E>(concurrency: number, fn: (item: T) => Promise<Result<B, E>>) =>
  async (arr: T[]): Promise<Result<B[], E[]>> => {
    if (concurrency < 1) throw new RangeError(`mapConcurrentResult: concurrency must be >= 1, got ${concurrency}`);

    const settled: Result<B, E>[] = new Array(arr.length);
    const executing = new Set<Promise<void>>();

    for (const [index, item] of arr.entries()) {
      const p: Promise<void> = fn(item)
        .then(r => { settled[index] = r; })
        .catch((e: unknown) => { settled[index] = Err(e as E); })
        .finally(() => { executing.delete(p); });
      executing.add(p);
      if (executing.size >= concurrency) await Promise.race(executing);
    }

    await Promise.all(executing);

    const values: B[] = [];
    const errors: E[] = [];
    for (const r of settled) {
      if (isOk(r)) values.push(r.value);
      else errors.push(r.error);
    }
    return errors.length === 0 ? Ok(values) : Err(errors);
  };

/**
 * Sequential variant of {@link mapConcurrentResult} (concurrency = 1).
 *
 * Maps over an array one element at a time, collecting all `Result` values.
 * Returns `Ok(values)` if all succeed, `Err(errors)` with all failures.
 *
 * @example
 * const results = await mapAsyncResult(async (id) =>
 *   fetchUser(id)
 * )(userIds);
 */
export const mapAsyncResult =
  <T, B, E>(fn: (item: T) => Promise<Result<B, E>>) =>
  (arr: T[]): Promise<Result<B[], E[]>> =>
    mapConcurrentResult(1, fn)(arr);

/**
 * Reduces an array with an async `Result`-returning reducer, stopping on the
 * first error (curried, data-last).
 *
 * Returns `Ok(finalAcc)` when every step succeeds, or `Err(firstError)` as
 * soon as a step fails.
 *
 * @example
 * const result = await reduceAsyncResult(
 *   async (acc, item) => processItem(acc, item),
 *   initialState
 * )(items);
 * // Ok(finalState) or Err(firstFailure)
 */
export const reduceAsyncResult =
  <T, B, E>(fn: (acc: B, item: T) => Promise<Result<B, E>>, initial: B) =>
  async (arr: T[]): Promise<Result<B, E>> => {
    let acc = initial;
    for (const item of arr) {
      const r = await fn(acc, item);
      if (!isOk(r)) return r;
      acc = r.value;
    }
    return Ok(acc);
  };
