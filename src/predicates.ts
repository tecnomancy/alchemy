/**
 * Predicate functions and type guards.
 * @module predicates
 */

// ============================================================================
// BASIC PREDICATES
// ============================================================================

/**
 * Returns true if the string is non-empty after trimming.
 *
 * @example
 * isNotEmpty('hello'); // true
 * isNotEmpty('');      // false
 * isNotEmpty('   ');   // false
 */
export const isNotEmpty = (str: string): boolean => str != null && str.trim().length > 0;

/**
 * Returns true if the value is neither null nor undefined.
 * Acts as a type guard, narrowing `T | null | undefined` to `T`.
 *
 * @example
 * isNotNull(0);         // true
 * isNotNull('');        // true
 * isNotNull(null);      // false
 * isNotNull(undefined); // false
 */
export const isNotNull = <T>(value: T | null | undefined): value is T => value != null;

/**
 * Returns true if the object has the given key and its value is not null/undefined
 * (curried, data-last).
 *
 * @example
 * const hasName = hasProperty<{ name: string }, 'name'>('name');
 * hasName({ name: 'Alice' }); // true
 */
export const hasProperty =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): boolean =>
    key in obj && obj[key] != null;

// ============================================================================
// LOGICAL COMBINATORS
// ============================================================================

/**
 * Inverts a predicate.
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * const isOdd = not(isEven);
 * isOdd(3); // true
 */
export const not =
  <T>(predicate: (value: T) => boolean) =>
  (value: T): boolean =>
    !predicate(value);

/**
 * Returns true if all provided predicates pass.
 *
 * @example
 * const isPositive = (x: number) => x > 0;
 * const isEven = (x: number) => x % 2 === 0;
 * const isPositiveEven = and(isPositive, isEven);
 * isPositiveEven(4);  // true
 * isPositiveEven(-2); // false
 */
export const and =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    predicates.every(p => p(value));

/**
 * Returns true if at least one predicate passes.
 *
 * @example
 * const isZero = (x: number) => x === 0;
 * const isNegative = (x: number) => x < 0;
 * const isZeroOrNegative = or(isZero, isNegative);
 * isZeroOrNegative(0);  // true
 * isZeroOrNegative(-5); // true
 * isZeroOrNegative(5);  // false
 */
export const or =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    predicates.some(p => p(value));

/**
 * Returns true if exactly one predicate passes (exclusive or).
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * const isPositive = (x: number) => x > 0;
 * const xorPred = xor(isEven, isPositive);
 * xorPred(2);  // false (both true)
 * xorPred(3);  // true  (only isPositive)
 * xorPred(-2); // true  (only isEven)
 */
export const xor =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean => {
    const trueCount = predicates.filter(p => p(value)).length;
    return trueCount === 1;
  };

/**
 * Returns true if not all predicates pass (negation of AND).
 *
 * @example
 * const isPositive = (x: number) => x > 0;
 * const isEven = (x: number) => x % 2 === 0;
 * nand(isPositive, isEven)(4); // false (both true)
 * nand(isPositive, isEven)(3); // true
 */
export const nand =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    !predicates.every(p => p(value));

/**
 * Returns true if no predicate passes (negation of OR).
 *
 * @example
 * const isPositive = (x: number) => x > 0;
 * const isEven = (x: number) => x % 2 === 0;
 * nor(isPositive, isEven)(-3); // true (neither)
 * nor(isPositive, isEven)(4);  // false
 */
export const nor =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    !predicates.some(p => p(value));

// ============================================================================
// COMPARISON PREDICATES
// ============================================================================

/**
 * Returns true if the value is strictly greater than the threshold (curried, data-last).
 *
 * @example
 * gt(10)(15); // true
 * gt(10)(5);  // false
 */
export const gt =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value > threshold;

/**
 * Returns true if the value is greater than or equal to the threshold (curried, data-last).
 *
 * @example
 * gte(10)(10); // true
 * gte(10)(11); // true
 */
export const gte =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value >= threshold;

/**
 * Returns true if the value is strictly less than the threshold (curried, data-last).
 *
 * @example
 * lt(10)(5);  // true
 * lt(10)(15); // false
 */
export const lt =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value < threshold;

/**
 * Returns true if the value is less than or equal to the threshold (curried, data-last).
 *
 * @example
 * lte(10)(10); // true
 * lte(10)(9);  // true
 */
export const lte =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value <= threshold;

/**
 * Returns true if the value is strictly equal to the target (curried, data-last).
 *
 * @example
 * eq(42)(42); // true
 * eq(42)(43); // false
 */
export const eq =
  <T>(target: T) =>
  (value: T): boolean =>
    value === target;

/**
 * Returns true if the value is not strictly equal to the target (curried, data-last).
 *
 * @example
 * neq(0)(1); // true
 * neq(0)(0); // false
 */
export const neq =
  <T>(target: T) =>
  (value: T): boolean =>
    value !== target;

/**
 * Returns true if the value falls within [min, max] inclusive (curried, data-last).
 *
 * @example
 * between(1, 10)(5);  // true
 * between(1, 10)(0);  // false
 * between(1, 10)(11); // false
 */
export const between =
  <T>(min: T, max: T) =>
  (value: T): boolean =>
    value >= min && value <= max;

// ============================================================================
// TYPE PREDICATES
// ============================================================================

/**
 * Type guard: returns true if the value is a string.
 *
 * @example
 * isString('hello'); // true
 * isString(42);      // false
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Type guard: returns true if the value is a number (including NaN).
 *
 * @example
 * isNumber(42);   // true
 * isNumber('42'); // false
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number';

/**
 * Type guard: returns true if the value is a boolean.
 *
 * @example
 * isBoolean(true); // true
 * isBoolean(1);    // false
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Type guard: returns true if the value is a function.
 *
 * @example
 * isFunction(() => {}); // true
 * isFunction(42);       // false
 */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function';

/**
 * Type guard: returns true if the value is an array.
 *
 * @example
 * isArray([1, 2]); // true
 * isArray({});     // false
 */
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

/**
 * Type guard: returns true if the value is strictly null.
 *
 * @example
 * isNull(null);      // true
 * isNull(undefined); // false
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Type guard: returns true if the value is strictly undefined.
 *
 * @example
 * isUndefined(undefined); // true
 * isUndefined(null);      // false
 */
export const isUndefined = (value: unknown): value is undefined => value === undefined;

/**
 * Type guard: returns true if the value is null or undefined.
 *
 * @example
 * isNil(null);      // true
 * isNil(undefined); // true
 * isNil(0);         // false
 */
export const isNil = (value: unknown): value is null | undefined => value == null;

/**
 * Type guard: returns true if the value is a valid (non-NaN) Date instance.
 *
 * @example
 * isDate(new Date());        // true
 * isDate(new Date('bad'));   // false
 * isDate('2024-01-01');      // false
 */
export const isDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime());

/**
 * Type guard: returns true if the value is a RegExp.
 *
 * @example
 * isRegExp(/test/); // true
 * isRegExp('test'); // false
 */
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/**
 * Type guard: returns true if the value is a Promise or thenable.
 *
 * @example
 * isPromise(Promise.resolve()); // true
 * isPromise({ then: () => {} }); // true
 * isPromise({});                // false
 */
export const isPromise = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise ||
  (typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).then === 'function');

// ============================================================================
// NUMERIC PREDICATES
// ============================================================================

/**
 * Returns true if the number is even.
 *
 * @example
 * isEven(4); // true
 * isEven(3); // false
 */
export const isEven = (n: number): boolean => n % 2 === 0;

/**
 * Returns true if the number is odd.
 *
 * @example
 * isOdd(3); // true
 * isOdd(4); // false
 */
export const isOdd = (n: number): boolean => n % 2 !== 0;

/**
 * Returns true if the number is strictly greater than zero.
 *
 * @example
 * isPositive(5);  // true
 * isPositive(0);  // false
 * isPositive(-1); // false
 */
export const isPositive = (n: number): boolean => n > 0;

/**
 * Returns true if the number is strictly less than zero.
 *
 * @example
 * isNegative(-1); // true
 * isNegative(0);  // false
 */
export const isNegative = (n: number): boolean => n < 0;

/**
 * Returns true if the number is exactly zero.
 *
 * @example
 * isZero(0);   // true
 * isZero(0.0); // true
 * isZero(1);   // false
 */
export const isZero = (n: number): boolean => n === 0;

/**
 * Returns true if the number is an integer.
 *
 * @example
 * isInteger(42);   // true
 * isInteger(42.5); // false
 */
export const isInteger = (n: number): boolean => Number.isInteger(n);

/**
 * Returns true if the value is NaN.
 *
 * Named `isNotANumber` to avoid shadowing the global `isNaN` built-in.
 *
 * @example
 * isNotANumber(NaN); // true
 * isNotANumber(0);   // false
 */
export const isNotANumber = (n: number): boolean => Number.isNaN(n);

/**
 * Returns true if the number is finite.
 *
 * Named `isFiniteNumber` to avoid shadowing the global `isFinite` built-in.
 *
 * @example
 * isFiniteNumber(42);       // true
 * isFiniteNumber(Infinity); // false
 */
export const isFiniteNumber = (n: number): boolean => Number.isFinite(n);

/**
 * Returns true if the number is positive or negative infinity.
 *
 * @example
 * isInfinite(Infinity);  // true
 * isInfinite(-Infinity); // true
 * isInfinite(42);        // false
 */
export const isInfinite = (n: number): boolean => !Number.isFinite(n) && !Number.isNaN(n);
