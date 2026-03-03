/**
 * Object transformation helpers: pick, omit, merge, deepMerge, mapValues, mapKeys, filterKeys, filterValues.
 * @internal
 */

import { isObject } from './object-utils.js';

// ============================================================================
// OBJECT TRANSFORMATIONS
// ============================================================================

/**
 * Returns a new object containing only the specified keys (curried, data-last).
 *
 * @example
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };
 * pick(['name', 'email'])(user);
 * // { name: 'Alice', email: 'alice@example.com' }
 */
export const pick =
  <T extends object, K extends keyof T>(keys: K[]) =>
  (obj: T): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  };

/**
 * Returns a new object with the specified keys removed (curried, data-last).
 *
 * @example
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * omit(['password'])(user);
 * // { id: 1, name: 'Alice' }
 */
export const omit =
  <T extends object, K extends keyof T>(keys: K[]) =>
  (obj: T): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  };

/**
 * Shallow-merges two objects, with the override taking precedence (curried, data-last).
 *
 * @example
 * const defaults = { theme: 'dark', lang: 'en' };
 * const userPrefs = { lang: 'pt' };
 * merge(defaults)(userPrefs);
 * // { theme: 'dark', lang: 'pt' }
 */
export const merge =
  <T extends object>(base: T) =>
  <U extends object>(override: U): T & U => ({
    ...base,
    ...override,
  });

/**
 * Recursively merges two objects. Arrays are replaced, not merged (curried, data-last).
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2, d: 3 } };
 * const obj2 = { b: { d: 4, e: 5 } };
 * deepMerge(obj1)(obj2);
 * // { a: 1, b: { c: 2, d: 4, e: 5 } }
 */
export const deepMerge =
  <T extends object>(base: T) =>
  <U extends object>(override: U): T & U => {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

    for (const key in override) {
      const overrideValue = override[key];
      const baseValue = result[key];

      if (
        isObject(overrideValue) &&
        isObject(baseValue) &&
        !Array.isArray(overrideValue) &&
        !Array.isArray(baseValue)
      ) {
        result[key] = deepMerge(baseValue)(overrideValue);
      } else {
        result[key] = overrideValue;
      }
    }

    return result as T & U;
  };

/**
 * Transforms every value in an object, preserving keys (curried, data-last).
 *
 * @example
 * const prices = { apple: 10, banana: 5, orange: 8 };
 * mapValues((price: number) => price * 2)(prices);
 * // { apple: 20, banana: 10, orange: 16 }
 */
export const mapValues =
  <T extends object, R>(fn: (value: T[keyof T], key: keyof T) => R) =>
  (obj: T): Record<keyof T, R> => {
    const result = {} as Record<keyof T, R>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = fn(obj[key], key);
      }
    }
    return result;
  };

/**
 * Transforms every key in an object, preserving values (curried, data-last).
 *
 * @example
 * const obj = { first_name: 'Alice', last_name: 'Smith' };
 * mapKeys((key: string) => key.replace('_', ''))(obj);
 * // { firstname: 'Alice', lastname: 'Smith' }
 */
export const mapKeys =
  <T extends object, K extends string>(fn: (key: keyof T) => K) =>
  (obj: T): Record<K, T[keyof T]> => {
    const result = {} as Record<K, T[keyof T]>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = fn(key);
        result[newKey] = obj[key];
      }
    }
    return result;
  };

/**
 * Returns a partial object containing only entries whose key passes the predicate
 * (curried, data-last).
 *
 * @example
 * const obj = { name: 'Alice', age: 30, _internal: true };
 * filterKeys((key: string) => !key.startsWith('_'))(obj);
 * // { name: 'Alice', age: 30 }
 */
export const filterKeys =
  <T extends object>(predicate: (key: keyof T) => boolean) =>
  (obj: T): Partial<T> => {
    const result = {} as Partial<T>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  };

/**
 * Returns a partial object containing only entries whose value passes the predicate
 * (curried, data-last).
 *
 * @example
 * const obj = { a: 1, b: null, c: 3, d: undefined };
 * filterValues((v: unknown) => v != null)(obj);
 * // { a: 1, c: 3 }
 */
export const filterValues =
  <T extends object>(predicate: (value: T[keyof T]) => boolean) =>
  (obj: T): Partial<T> => {
    const result = {} as Partial<T>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (predicate(value)) {
          result[key] = value;
        }
      }
    }
    return result;
  };
