/**
 * Functional array utilities — curried, data-last, pipe-friendly.
 * @module array
 */

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

/**
 * Maps a function over every element of an array (curried).
 *
 * @example
 * map((x: number) => x * 2)([1, 2, 3]); // [2, 4, 6]
 */
export const map =
  <T, R>(fn: (item: T) => R) =>
  (arr: T[]): R[] =>
    arr.map(fn);

/**
 * Filters an array by a predicate (curried).
 *
 * @example
 * filter((x: number) => x % 2 === 0)([1, 2, 3, 4]); // [2, 4]
 */
export const filter =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T[] =>
    arr.filter(predicate);

/**
 * Reduces an array to a single value (curried).
 *
 * @example
 * reduce((acc: number, x: number) => acc + x, 0)([1, 2, 3, 4]); // 10
 */
export const reduce =
  <T, R>(fn: (acc: R, item: T) => R, initial: R) =>
  (arr: T[]): R =>
    arr.reduce(fn, initial);

/**
 * Maps and flattens one level (curried).
 *
 * @example
 * flatMapArray((x: number) => [x, x])([1, 2]); // [1, 1, 2, 2]
 */
export const flatMapArray =
  <T, R>(fn: (item: T) => R[]) =>
  (arr: T[]): R[] =>
    arr.flatMap(fn);

/**
 * Sorts an array by a key extractor, ascending (curried). Does not mutate.
 *
 * @example
 * sortBy((u: { name: string }) => u.name)([{ name: 'Bob' }, { name: 'Alice' }]);
 * // [{ name: 'Alice' }, { name: 'Bob' }]
 */
export const sortBy =
  <T>(fn: (item: T) => string | number) =>
  (arr: T[]): T[] =>
    [...arr].sort((a, b) => {
      const valA = fn(a);
      const valB = fn(b);
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

/**
 * Removes duplicate values from an array.
 *
 * @example
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 */
export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Returns the first N elements of an array (curried).
 *
 * @example
 * take(2)([1, 2, 3, 4]); // [1, 2]
 */
export const take =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(0, n);

/**
 * Skips the first N elements of an array (curried).
 *
 * @example
 * skip(2)([1, 2, 3, 4]); // [3, 4]
 */
export const skip =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(n);

/**
 * Returns the first element that satisfies the predicate (curried).
 *
 * @example
 * find((x: number) => x % 2 === 0)([1, 3, 4, 5]); // 4
 */
export const find =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T | undefined =>
    arr.find(predicate);

/**
 * Returns true if at least one element satisfies the predicate (curried).
 *
 * @example
 * some((x: number) => x % 2 === 0)([1, 3, 5]); // false
 * some((x: number) => x % 2 === 0)([1, 2, 3]); // true
 */
export const some =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.some(predicate);

/**
 * Returns true if every element satisfies the predicate (curried).
 *
 * @example
 * every((x: number) => x % 2 === 0)([2, 4, 6]); // true
 * every((x: number) => x % 2 === 0)([2, 3, 4]); // false
 */
export const every =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.every(predicate);

// ============================================================================
// GROUPING
// ============================================================================

/**
 * Groups elements by a key extractor (curried).
 *
 * @example
 * groupBy((u: { role: string }) => u.role)([
 *   { name: 'Alice', role: 'admin' },
 *   { name: 'Bob',   role: 'user'  },
 *   { name: 'Carol', role: 'admin' },
 * ]);
 * // { admin: [...], user: [...] }
 */
export const groupBy =
  <T, K extends string | number>(fn: (item: T) => K) =>
  (arr: T[]): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (const item of arr) {
      const key = fn(item);
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  };

/**
 * Counts occurrences by a key extractor (curried).
 *
 * @example
 * countBy((x: number) => x % 2 === 0 ? 'even' : 'odd')([1, 2, 3, 4]);
 * // { odd: 2, even: 2 }
 */
export const countBy =
  <T, K extends string | number>(fn: (item: T) => K) =>
  (arr: T[]): Record<K, number> => {
    const result = {} as Record<K, number>;
    for (const item of arr) {
      const key = fn(item);
      result[key] = (result[key] || 0) + 1;
    }
    return result;
  };

/**
 * Splits an array into two arrays based on a predicate (curried).
 * The first array contains elements that pass; the second those that do not.
 *
 * @example
 * partition((x: number) => x % 2 === 0)([1, 2, 3, 4]);
 * // [[2, 4], [1, 3]]
 */
export const partition =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];
    for (const item of arr) {
      if (predicate(item)) truthy.push(item);
      else falsy.push(item);
    }
    return [truthy, falsy];
  };

// ============================================================================
// FLATTEN / RESHAPE
// ============================================================================

/**
 * Flattens an array one level deep.
 *
 * @example
 * flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 */
export const flatten = <T>(arr: T[][]): T[] => arr.flat();

/**
 * Recursively flattens a nested array.
 *
 * @example
 * flattenDeep([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
 */
export const flattenDeep = <T>(arr: unknown[]): T[] => arr.flat(Infinity) as T[];

/**
 * Combines two arrays into an array of tuples, truncated to the shorter length.
 *
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c']); // [[1,'a'], [2,'b'], [3,'c']]
 */
export const zip = <T, U>(arr1: T[], arr2: U[]): Array<[T, U]> => {
  const length = Math.min(arr1.length, arr2.length);
  const result: Array<[T, U]> = [];
  for (let i = 0; i < length; i++) result.push([arr1[i], arr2[i]]);
  return result;
};

/**
 * Splits an array of tuples into two separate arrays.
 *
 * @example
 * unzip([[1, 'a'], [2, 'b']]); // [[1, 2], ['a', 'b']]
 */
export const unzip = <T, U>(arr: Array<[T, U]>): [T[], U[]] => {
  const first: T[] = [];
  const second: U[] = [];
  for (const [a, b] of arr) {
    first.push(a);
    second.push(b);
  }
  return [first, second];
};

/**
 * Splits an array into chunks of size N (curried).
 *
 * @example
 * chunk(2)([1, 2, 3, 4, 5]); // [[1, 2], [3, 4], [5]]
 */
export const chunk =
  (size: number) =>
  <T>(arr: T[]): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Removes falsy values (`null`, `undefined`, `false`, `0`, `''`) from an array.
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined]); // [1, 2, 3]
 */
export const compact = <T>(arr: Array<T | null | undefined | false | 0 | ''>): T[] =>
  arr.filter(Boolean) as T[];

/**
 * Returns true if the value is a non-empty array.
 *
 * @example
 * hasItems([1, 2]); // true
 * hasItems([]);     // false
 */
export const hasItems = <T>(arr: T[]): boolean => Array.isArray(arr) && arr.length > 0;
