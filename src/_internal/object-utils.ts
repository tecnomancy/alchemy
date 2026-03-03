/**
 * Shared type guard utilities for object operations.
 * @internal
 */

/**
 * Returns true if the value is a plain object (not an array, not null).
 *
 * @example
 * isObject({}); // true
 * isObject([]); // false
 * isObject(null); // false
 */
export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
