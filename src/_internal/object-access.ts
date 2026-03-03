/**
 * Object access and introspection helpers: keys, values, entries, fromEntries,
 * hasKey, getPath, setPath, updatePath, isEmpty, equals, clone, freeze.
 * @internal
 */

import { isObject } from './object-utils.js';

// ============================================================================
// OBJECT QUERIES
// ============================================================================

/**
 * Returns the keys of an object as a typed array.
 *
 * @example
 * keys({ a: 1, b: 2, c: 3 });
 * // ['a', 'b', 'c']
 */
export const keys = <T extends object>(obj: T): Array<keyof T> =>
  Object.keys(obj) as Array<keyof T>;

/**
 * Returns the values of an object as an array.
 *
 * @example
 * values({ a: 1, b: 2, c: 3 });
 * // [1, 2, 3]
 */
export const values = <T extends object>(obj: T): Array<T[keyof T]> => Object.values(obj);

/**
 * Returns `[key, value]` pairs for an object.
 *
 * @example
 * entries({ a: 1, b: 2 });
 * // [['a', 1], ['b', 2]]
 */
export const entries = <T extends object>(obj: T): Array<[keyof T, T[keyof T]]> =>
  Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

/**
 * Reconstructs an object from an array of `[key, value]` pairs.
 *
 * @example
 * fromEntries([['a', 1], ['b', 2]]);
 * // { a: 1, b: 2 }
 */
export const fromEntries = <K extends string, V>(pairs: Array<[K, V]>): Record<K, V> =>
  Object.fromEntries(pairs) as Record<K, V>;

/**
 * Returns true if the given key exists in the object (curried, data-last).
 *
 * @example
 * hasKey('name')({ name: 'Alice', age: 30 }); // true
 */
export const hasKey =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): boolean =>
    key in obj;

/**
 * Reads a value from an arbitrarily nested path. Returns `undefined` if any
 * segment along the path is missing (curried, data-last).
 *
 * @example
 * const user = { profile: { name: 'Alice' } };
 * getPath(['profile', 'name'])(user);
 * // 'Alice'
 */
export const getPath =
  <T extends object>(path: string[]) =>
  (obj: T): unknown => {
    let result: unknown = obj;
    for (const key of path) {
      if (result == null) return undefined;
      result = (result as Record<string, unknown>)[key];
    }
    return result;
  };

/**
 * Returns a new object with the value at the given path replaced.
 * Does not mutate the original (curried, data-last).
 *
 * @example
 * const user = { profile: { name: 'Alice' } };
 * setPath(['profile', 'name'], 'Bob')(user);
 * // { profile: { name: 'Bob' } }
 */
export const setPath =
  <T extends object>(path: string[], value: unknown) =>
  (obj: T): T => {
    if (path.length === 0) return obj;

    const [head, ...tail] = path;
    const currentValue = (obj as Record<string, unknown>)[head];

    if (tail.length === 0) {
      return {
        ...obj,
        [head]: value,
      } as T;
    }

    return {
      ...obj,
      [head]: setPath(tail, value)(isObject(currentValue) ? currentValue : {}),
    } as T;
  };

/**
 * Applies a function to the value at the given path and returns a new object.
 * Does not mutate the original (curried, data-last).
 *
 * @example
 * const user = { profile: { age: 30 } };
 * updatePath(['profile', 'age'], (age: number) => age + 1)(user);
 * // { profile: { age: 31 } }
 */
export const updatePath =
  <T extends object>(path: string[], fn: (value: unknown) => unknown) =>
  (obj: T): T => {
    const currentValue = getPath(path)(obj);
    const newValue = fn(currentValue);
    return setPath(path, newValue)(obj) as T;
  };

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Returns true if the object has no own enumerable properties.
 *
 * @example
 * isEmpty({}); // true
 * isEmpty({ a: 1 }); // false
 */
export const isEmpty = <T extends object>(obj: T): boolean => Object.keys(obj).length === 0;

/**
 * Deep-equality comparison for two objects (curried, data-last).
 *
 * @example
 * equals({ a: 1, b: { c: 2 } })({ a: 1, b: { c: 2 } }); // true
 * equals({ a: 1 })({ a: 2 }); // false
 */
export const equals =
  <T extends object>(obj1: T) =>
  (obj2: T): boolean => {
    if (obj1 === obj2) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const val1 = (obj1 as Record<string, unknown>)[key];
      const val2 = (obj2 as Record<string, unknown>)[key];

      if (isObject(val1) && isObject(val2)) {
        if (!equals(val1)(val2)) return false;
      } else if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        for (let i = 0; i < val1.length; i++) {
          if (isObject(val1[i]) && isObject(val2[i])) {
            if (!equals(val1[i])(val2[i])) return false;
          } else if (val1[i] !== val2[i]) {
            return false;
          }
        }
      } else if (val1 !== val2) {
        return false;
      }
    }

    return true;
  };

/**
 * Returns a deep clone of the value. Handles plain objects, arrays, and Dates.
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copy = clone(original);
 * copy.b.c = 999;
 * console.log(original.b.c); // 2 — original is unchanged
 */
export const clone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => clone(item)) as T;
  }

  if (obj instanceof Object) {
    const clonedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = clone((obj as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as T;
  }

  return obj;
};

/**
 * Recursively freezes an object, making it and all nested objects immutable.
 *
 * @example
 * const obj = freeze({ a: 1, b: { c: 2 } });
 * obj.a = 999; // throws in strict mode
 */
export const freeze = <T extends object>(obj: T): Readonly<T> => {
  Object.freeze(obj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (isObject(value)) {
        freeze(value);
      }
    }
  }

  return obj;
};
