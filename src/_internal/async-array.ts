/**
 * Async array transformation helpers: mapAsync, mapParallel, mapConcurrent, filterAsync, reduceAsync.
 * @internal
 */

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
