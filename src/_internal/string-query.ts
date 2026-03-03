/**
 * String query and introspection helpers: startsWith, endsWith, includes, matches, etc.
 * @internal
 */

// ============================================================================
// STRING QUERIES
// ============================================================================

/**
 * Returns true if the string starts with the given substring (curried, data-last).
 *
 * @example
 * startsWith('hello')('hello world'); // true
 */
export const startsWith =
  (search: string) =>
  (str: string): boolean =>
    str.startsWith(search);

/**
 * Returns true if the string ends with the given substring (curried, data-last).
 *
 * @example
 * endsWith('world')('hello world'); // true
 */
export const endsWith =
  (search: string) =>
  (str: string): boolean =>
    str.endsWith(search);

/**
 * Returns true if the string contains the given substring (curried, data-last).
 *
 * @example
 * includes('llo')('hello'); // true
 */
export const includes =
  (search: string) =>
  (str: string): boolean =>
    str.includes(search);

/**
 * Returns true if the string matches the given regex (curried, data-last).
 *
 * @example
 * matches(/^\d+$/)('123'); // true
 */
export const matches =
  (regex: RegExp) =>
  (str: string): boolean =>
    regex.test(str);

/**
 * Returns true if the string has zero characters.
 *
 * @example
 * isEmptyString('');   // true
 * isEmptyString('  '); // false
 */
export const isEmptyString = (str: string): boolean => str.length === 0;

/**
 * Returns true if the string is empty or contains only whitespace.
 *
 * @example
 * isBlank('');   // true
 * isBlank('  '); // true
 */
export const isBlank = (str: string): boolean => str.trim().length === 0;

/**
 * Returns the number of characters in the string.
 *
 * @example
 * length('hello'); // 5
 */
export const length = (str: string): number => str.length;
