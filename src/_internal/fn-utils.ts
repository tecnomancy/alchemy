/**
 * General function utilities: identity, constant, prop, curry, partial, flip, tap,
 * memoize, once, after, before, negate.
 * @internal
 */

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Returns the value passed in unchanged (identity function).
 *
 * @example
 * identity(5); // 5
 * [1, 2, 3].map(identity); // [1, 2, 3]
 */
export const identity = <T>(value: T): T => value;

/**
 * Returns a constant function that always returns the given value.
 *
 * @example
 * const always42 = constant(42);
 * always42('anything'); // 42
 */
export const constant =
  <T>(value: T) =>
  (..._args: unknown[]): T =>
    value;

/**
 * Reads a property from an object (curried, data-last).
 *
 * @example
 * const getName = prop('name');
 * getName({ name: 'Alice', age: 30 }); // 'Alice'
 */
export const prop =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): T[K] | undefined =>
    obj?.[key];

/**
 * Transforms a multi-argument function into a chain of single-argument functions.
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 * curriedAdd(1)(2)(3); // 6
 * curriedAdd(1, 2)(3); // 6
 */
export const curry = <T extends unknown[], R>(
  fn: (...args: T) => R
): ((...args: readonly unknown[]) => unknown) => {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn(...(args as T));
    }
    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  };
};

/**
 * Applies a function with some arguments pre-filled.
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const add5 = partial(add, 5);
 * add5(3, 2); // 10
 */
export const partial =
  <T extends unknown[], R>(fn: (...args: T) => R, ...partialArgs: unknown[]) =>
  (...remainingArgs: unknown[]): R =>
    fn(...([...partialArgs, ...remainingArgs] as T));

/**
 * Returns a function that calls the original with its two arguments swapped.
 *
 * @example
 * const divide = (a: number, b: number) => a / b;
 * const flippedDivide = flip(divide);
 * divide(10, 2);         // 5
 * flippedDivide(2, 10);  // 5
 */
export const flip =
  <A, B, R>(fn: (a: A, b: B) => R) =>
  (b: B, a: A): R =>
    fn(a, b);

/**
 * Executes a side-effect function and returns the original value unchanged.
 *
 * @example
 * pipe(
 *   5,
 *   (x) => x * 2,
 *   tap(console.log), // logs 10
 *   (x) => x + 3,
 * ); // 13
 */
export const tap =
  <T>(fn: (value: T) => void) =>
  (value: T): T => {
    fn(value);
    return value;
  };

/**
 * Caches the results of a pure function keyed by its arguments.
 *
 * @param fn - The function whose results should be cached. Should be pure (same args → same result).
 * @param keyFn - Produces the cache key from the arguments (default: `JSON.stringify(args)`).
 *   Use a custom `keyFn` when args contain non-serialisable values (e.g. objects by reference).
 * @returns A memoized wrapper that returns cached results on repeated calls with equal keys.
 *
 * @example
 * const slowFn = (n: number) => n * 2;
 * const fastFn = memoize(slowFn);
 * fastFn(5); // computed
 * fastFn(5); // cached
 */
export const memoize = <T extends unknown[], R>(
  fn: (...args: T) => R,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args)
): ((...args: T) => R) => {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Returns a function that executes the wrapped function only on its first call.
 * Subsequent calls return the cached result.
 *
 * @example
 * const init = once(() => console.log('Initialized'));
 * init(); // logs 'Initialized'
 * init(); // no-op
 */
export const once = <T extends unknown[], R>(fn: (...args: T) => R) => {
  let called = false;
  let result: R;

  return (...args: T): R => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
};

/**
 * Returns a function that executes only after being called at least N times.
 *
 * @example
 * const log = after(3, () => console.log('Called 3 times'));
 * log(); // no-op
 * log(); // no-op
 * log(); // logs 'Called 3 times'
 */
export const after = <T extends unknown[], R>(n: number, fn: (...args: T) => R) => {
  let count = 0;

  return (...args: T): R | undefined => {
    count++;
    if (count >= n) {
      return fn(...args);
    }
    return undefined;
  };
};

/**
 * Returns a function that executes only during the first N-1 calls.
 * After that, the last computed result is returned without calling the function.
 *
 * @example
 * const log = before(3, () => console.log('First 2 calls'));
 * log(); // logs
 * log(); // logs
 * log(); // returns last result, does not call fn
 */
export const before = <T extends unknown[], R>(n: number, fn: (...args: T) => R) => {
  let count = 0;
  let result: R | undefined;

  return (...args: T): R | undefined => {
    if (count < n - 1) {
      result = fn(...args);
      count++;
    }
    return result;
  };
};

/**
 * Returns a function that negates the result of a predicate.
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * const isOdd = negate(isEven);
 * isOdd(3); // true
 */
export const negate =
  <T extends unknown[]>(predicate: (...args: T) => boolean) =>
  (...args: T): boolean =>
    !predicate(...args);
