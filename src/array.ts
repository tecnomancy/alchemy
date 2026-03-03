/**
 * Functional array transformation utilities.
 * @module array
 */

import type { Option } from './option.js';
import { Some, None } from './option.js';

// ============================================================================
// ARRAY TRANSFORMATIONS
// ============================================================================

/**
 * Applies a function to every element of an array (curried, data-last).
 *
 * @example
 * const double = (x: number) => x * 2;
 * map(double)([1, 2, 3]); // [2, 4, 6]
 */
export const map =
  <T, R>(fn: (item: T) => R) =>
  (arr: T[]): R[] =>
    arr.map(fn);

/**
 * Keeps elements that satisfy a predicate (curried, data-last).
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * filter(isEven)([1, 2, 3, 4]); // [2, 4]
 */
export const filter =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T[] =>
    arr.filter(predicate);

/**
 * Folds an array into a single value (curried, data-last).
 *
 * @example
 * const sum = (acc: number, x: number) => acc + x;
 * reduce(sum, 0)([1, 2, 3, 4]); // 10
 */
export const reduce =
  <T, R>(fn: (acc: R, item: T) => R, initial: R) =>
  (arr: T[]): R =>
    arr.reduce(fn, initial);

/**
 * Maps over an array and flattens one level (curried, data-last).
 *
 * @example
 * const duplicate = (x: number) => [x, x];
 * flatMapArray(duplicate)([1, 2]); // [1, 1, 2, 2]
 */
export const flatMapArray =
  <T, R>(fn: (item: T) => R[]) =>
  (arr: T[]): R[] =>
    arr.flatMap(fn);

/**
 * Sorts an array by a key extractor without mutating the original (curried, data-last).
 *
 * @example
 * const users = [{ name: 'Bob' }, { name: 'Alice' }];
 * sortBy((u: { name: string }) => u.name)(users);
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
 * Removes duplicate values from an array, preserving insertion order.
 *
 * @example
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 */
export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Returns the first N elements of an array (curried, data-last).
 *
 * @example
 * take(2)([1, 2, 3, 4]); // [1, 2]
 */
export const take =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(0, n);

/**
 * Drops the first N elements of an array (curried, data-last).
 *
 * @example
 * skip(2)([1, 2, 3, 4]); // [3, 4]
 */
export const skip =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(n);

/**
 * Returns the first element that satisfies a predicate (curried, data-last).
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * find(isEven)([1, 3, 4, 5]); // 4
 */
export const find =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T | undefined =>
    arr.find(predicate);

/**
 * Returns true if at least one element satisfies the predicate (curried, data-last).
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * some(isEven)([1, 3, 5]); // false
 * some(isEven)([1, 2, 3]); // true
 */
export const some =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.some(predicate);

/**
 * Returns true if every element satisfies the predicate (curried, data-last).
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * every(isEven)([2, 4, 6]); // true
 * every(isEven)([2, 3, 4]); // false
 */
export const every =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.every(predicate);

/**
 * Groups array elements by a key extractor (curried, data-last).
 *
 * @example
 * const users = [
 *   { name: 'Alice', role: 'admin' },
 *   { name: 'Bob', role: 'user' },
 *   { name: 'Charlie', role: 'admin' },
 * ];
 * groupBy((u) => u.role)(users);
 * // {
 * //   admin: [{ name: 'Alice', role: 'admin' }, { name: 'Charlie', role: 'admin' }],
 * //   user:  [{ name: 'Bob', role: 'user' }]
 * // }
 */
export const groupBy =
  <T, K extends string | number>(fn: (item: T) => K) =>
  (arr: T[]): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (const item of arr) {
      const key = fn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  };

/**
 * Counts occurrences of each key produced by the extractor (curried, data-last).
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
 * Splits an array into two groups based on a predicate (curried, data-last).
 * First tuple element contains matches; second contains non-matches.
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * partition(isEven)([1, 2, 3, 4]);
 * // [[2, 4], [1, 3]]
 */
export const partition =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];
    for (const item of arr) {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }
    return [truthy, falsy];
  };

/**
 * Flattens a nested array one level deep.
 *
 * @example
 * flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 */
export const flatten = <T>(arr: T[][]): T[] => arr.flat();

/**
 * Recursively flattens a deeply nested array.
 *
 * @example
 * flattenDeep([1, [2, [3, [4, [5]]]]]); // [1, 2, 3, 4, 5]
 */
export const flattenDeep = <T>(arr: unknown[]): T[] => arr.flat(Infinity) as T[];

/**
 * Combines two arrays into an array of tuples, truncated to the shorter length.
 *
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c']);
 * // [[1, 'a'], [2, 'b'], [3, 'c']]
 */
export const zip = <T, U>(arr1: T[], arr2: U[]): Array<[T, U]> => {
  const length = Math.min(arr1.length, arr2.length);
  const result: Array<[T, U]> = [];
  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
};

/**
 * Splits an array of tuples into two separate arrays.
 *
 * @example
 * unzip([[1, 'a'], [2, 'b'], [3, 'c']]);
 * // [[1, 2, 3], ['a', 'b', 'c']]
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
 * Splits an array into chunks of a given size (curried, data-last).
 *
 * @example
 * chunk(2)([1, 2, 3, 4, 5]); // [[1, 2], [3, 4], [5]]
 */
export const chunk =
  (size: number) =>
  <T>(arr: T[]): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

/**
 * Removes falsy values from an array (`null`, `undefined`, `false`, `0`, `''`).
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined]);
 * // [1, 2, 3]
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

// ============================================================================
// SAFE ARRAY NAVIGATION (Option-returning)
// ============================================================================

/**
 * Returns the first element of an array, or None if empty.
 * @example
 * head([1, 2, 3]); // Some(1)
 * head([]);        // None
 */
export const head = <T>(arr: T[]): Option<T> =>
  arr.length > 0 ? Some(arr[0]) : None;

/**
 * Returns all elements except the first, or None if array is empty.
 * @example
 * tail([1, 2, 3]); // Some([2, 3])
 * tail([1]);       // Some([])
 * tail([]);        // None
 */
export const tail = <T>(arr: T[]): Option<T[]> =>
  arr.length > 0 ? Some(arr.slice(1)) : None;

/**
 * Returns the last element of an array, or None if empty.
 * @example
 * last([1, 2, 3]); // Some(3)
 * last([]);        // None
 */
export const last = <T>(arr: T[]): Option<T> =>
  arr.length > 0 ? Some(arr[arr.length - 1]) : None;

/**
 * Returns all elements except the last, or None if array is empty.
 * @example
 * init([1, 2, 3]); // Some([1, 2])
 * init([1]);       // Some([])
 * init([]);        // None
 */
export const init = <T>(arr: T[]): Option<T[]> =>
  arr.length > 0 ? Some(arr.slice(0, -1)) : None;

/**
 * Returns the element at index n (supports negative indices from end), or None if out of bounds.
 * Curried, data-last.
 * @example
 * nth(0)([10, 20, 30]);  // Some(10)
 * nth(-1)([10, 20, 30]); // Some(30)
 * nth(5)([10, 20]);      // None
 */
export const nth =
  (n: number) =>
  <T>(arr: T[]): Option<T> => {
    const idx = n < 0 ? arr.length + n : n;
    return idx >= 0 && idx < arr.length ? Some(arr[idx]) : None;
  };
