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
 * @param path - Array of keys describing the nested location to write.
 *   An empty path returns the object unchanged.
 * @param value - The new value to set at the path. Intermediate objects are
 *   created as `{}` if a segment is missing or non-object.
 * @returns A structurally-shared copy of the input with the path updated.
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

    const [head, ...tail] = path as [string, ...string[]];
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

/**
 * Like {@link getPath} but returns a fallback value instead of `undefined`
 * when the path is missing (curried, data-last).
 *
 * @remarks
 * The fallback is returned whenever the resolved value is `undefined` — this
 * includes the case where a key explicitly exists but its stored value is
 * `undefined`. This matches the behaviour of `lodash.get` and `Ramda.pathOr`.
 * Use {@link hasPath} when you need to distinguish "key absent" from
 * "key present with value `undefined`".
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * getPathOr(0, ['a', 'b', 'c'])(obj); // 42
 * getPathOr(0, ['a', 'b', 'x'])(obj); // 0 — path missing
 *
 * // Key exists but value is undefined — fallback is returned
 * getPathOr(99, ['a'])({ a: undefined }); // 99
 * // hasPath still reports the key as present:
 * hasPath(['a'])({ a: undefined }); // true
 */
export const getPathOr =
  <T>(fallback: T, path: string[]) =>
  (obj: object): T => {
    const result = getPath(path)(obj);
    return result !== undefined ? (result as T) : fallback;
  };

/**
 * Returns `true` if the nested path exists in the object, even when the value
 * at that path is `null` or `undefined` (curried, data-last).
 *
 * @example
 * hasPath(['a', 'b', 'c'])({ a: { b: { c: null } } }); // true
 * hasPath(['a', 'b', 'x'])({ a: { b: { c: 1 } } });    // false
 */
export const hasPath =
  (path: string[]) =>
  (obj: unknown): boolean => {
    if (path.length === 0) return true;
    let current: unknown = obj;
    for (const key of path) {
      if (current === null || typeof current !== 'object') return false;
      if (!Object.prototype.hasOwnProperty.call(current, key)) return false;
      current = (current as Record<string, unknown>)[key];
    }
    return true;
  };

/**
 * Returns a new object with the value at the given path removed.
 * Does not mutate the original (curried, data-last).
 *
 * @example
 * deletePath(['a', 'b'])({ a: { b: 1, c: 2 } });
 * // { a: { c: 2 } }
 */
export const deletePath =
  (path: string[]) =>
  <T extends object>(obj: T): T => {
    if (path.length === 0) return obj;
    const [head, ...tail] = path as [string, ...string[]];
    if (tail.length === 0) {
      const { [head]: _removed, ...rest } = obj as Record<string, unknown>;
      return rest as T;
    }
    const current = (obj as Record<string, unknown>)[head];
    if (!isObject(current)) return obj;
    return {
      ...obj,
      [head]: deletePath(tail)(current),
    } as T;
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

/** Recursive value equality used internally by equals. */
const equalsValue = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equalsValue(a[i], b[i])) return false;
    }
    return true;
  }
  if (isObject(a) && isObject(b)) return equals(a)(b);
  return false;
};

/**
 * Structural equality comparison for two plain objects (curried, data-last).
 *
 * Recursively compares own enumerable keys and their values. Does **not**
 * handle `Date`, `RegExp`, `Map`, `Set`, top-level arrays, or circular
 * references. For those cases use {@link deepEquals}.
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

      if (!equalsValue(val1, val2)) {
        return false;
      }
    }

    return true;
  };

/**
 * Returns a deep clone of the value. Handles plain objects, arrays, and Dates.
 *
 * Does **not** detect circular references or clone `Map`, `Set`, or `RegExp`.
 * For those cases use {@link deepClone}.
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
    for (const key of Object.keys(obj)) {
      clonedObj[key] = clone((obj as Record<string, unknown>)[key]);
    }
    return clonedObj as T;
  }

  return obj;
};

// ============================================================================
// DEEP EQUALITY & DEEP CLONE
// ============================================================================

/** Internal recursive helper — carries a seen-map for cycle detection. */
const deepEq = (a: unknown, b: unknown, seen: Map<unknown, unknown>): boolean => {
  if (Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  // Leaf types that don't recurse — check before registering in seen-map
  if (a instanceof Date) return a.getTime() === (b as Date).getTime();
  if (a instanceof RegExp) {
    return a.source === (b as RegExp).source && a.flags === (b as RegExp).flags;
  }

  if (seen.has(a)) return seen.get(a) === b;
  seen.set(a, b);

  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEq(a[i], (b as unknown[])[i], seen)) return false;
    }
    return true;
  }

  if (a instanceof Map) {
    const bm = b as Map<unknown, unknown>;
    if (a.size !== bm.size) return false;
    for (const [k, v] of a) {
      if (!bm.has(k) || !deepEq(v, bm.get(k), seen)) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    const bs = b as Set<unknown>;
    if (a.size !== bs.size) return false;
    for (const v of a) {
      if (!bs.has(v)) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEq(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
      seen,
    )) return false;
  }
  return true;
}

/**
 * Deep equality comparison supporting any value type (curried, data-last).
 *
 * Handles primitives, plain objects, arrays, `Date`, `RegExp`, `Map`, `Set`,
 * and circular references. Two circular structures are equal if they mirror
 * each other structurally.
 *
 * @remarks
 * `Set` membership is compared by reference for object values. Two sets
 * containing structurally identical (but distinct) objects are **not** equal:
 * `deepEquals(new Set([{a:1}]))(new Set([{a:1}]))` returns `false`.
 * For primitive-only sets this is not a concern.
 *
 * @example
 * deepEquals({ x: { y: 1 } })({ x: { y: 1 } }); // true
 * deepEquals([1, [2, 3]])([1, [2, 3]]);           // true
 * deepEquals(new Date('2020-01-01'))(new Date('2020-01-01')); // true
 *
 * const a: Record<string, unknown> = {};
 * a['self'] = a;
 * const b: Record<string, unknown> = {};
 * b['self'] = b;
 * deepEquals(a)(b); // true — mirrored cycle
 */
export const deepEquals =
  <T>(a: T) =>
  (b: T): boolean =>
    deepEq(a, b, new Map());

/** Internal recursive helper — carries a seen-map for cycle detection. */
const deepCopy = (value: unknown, seen: Map<unknown, unknown>): unknown => {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    seen.set(value, copy);
    return copy;
  }

  if (value instanceof RegExp) {
    const copy = new RegExp(value.source, value.flags);
    seen.set(value, copy);
    return copy;
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    for (const item of value) copy.push(deepCopy(item, seen));
    return copy;
  }

  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(value, copy);
    for (const [k, v] of value) copy.set(deepCopy(k, seen), deepCopy(v, seen));
    return copy;
  }

  if (value instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(value, copy);
    for (const v of value) copy.add(deepCopy(v, seen));
    return copy;
  }

  const copy = Object.create(Object.getPrototypeOf(value) as object) as Record<string, unknown>;
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    copy[key] = deepCopy((value as Record<string, unknown>)[key], seen);
  }
  return copy;
}

/**
 * Returns a deep clone of any value with full cycle detection.
 *
 * Handles primitives, plain objects, arrays, `Date`, `RegExp`, `Map`, `Set`,
 * and circular references. Circular references are reproduced in the clone.
 *
 * @example
 * const obj = { a: { b: 2 } };
 * const copy = deepClone(obj);
 * copy.a.b = 99;
 * obj.a.b; // 2 — untouched
 *
 * const arr = [[1, 2], [3, 4]];
 * const copy2 = deepClone(arr);
 * copy2[0][0] = 99;
 * arr[0][0]; // 1 — untouched
 */
export const deepClone = <T>(value: T): T => deepCopy(value, new Map()) as T;

/**
 * Recursively freezes an object, making it and all nested objects immutable.
 *
 * @example
 * const obj = freeze({ a: 1, b: { c: 2 } });
 * obj.a = 999; // throws in strict mode
 */
export const freeze = <T extends object>(obj: T): Readonly<T> => {
  Object.freeze(obj);

  for (const key of Object.keys(obj)) {
    const value = obj[key as keyof T];
    if (isObject(value)) {
      freeze(value);
    }
  }

  return obj;
};
