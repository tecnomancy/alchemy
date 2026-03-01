/**
 * Option<T> — explicit nullability without null checks
 *
 * Inspired by Rust's `Option<T>` and Haskell's `Maybe`.
 * Use this when a value may legitimately be absent.
 * Use `Result<T, E>` when absence means *failure with a reason*.
 *
 * @module option
 */

// ============================================================================
// TYPE
// ============================================================================

export type Some<T> = { readonly _tag: 'Some'; readonly value: T };
export type None = { readonly _tag: 'None' };
export type Option<T> = Some<T> | None;

// ============================================================================
// CONSTRUCTORS
// ============================================================================

export const Some = <T>(value: T): Option<T> => ({ _tag: 'Some', value });
export const None: Option<never> = Object.freeze({ _tag: 'None' });

/** Wraps a nullable value into an Option. */
export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value == null ? None : Some(value);

/** Creates an Option from a possibly-throwing function. */
export const fromTryCatch = <T>(fn: () => T): Option<T> => {
  try {
    return Some(fn());
  } catch {
    return None;
  }
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isSome = <T>(opt: Option<T>): opt is Some<T> => opt._tag === 'Some';
export const isNone = <T>(opt: Option<T>): opt is None => opt._tag === 'None';

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

/**
 * Transform the inner value if Some, pass None through.
 *
 * @example
 * pipe(Some(5), mapOption(x => x * 2)) // Some(10)
 * pipe(None,    mapOption(x => x * 2)) // None
 */
export const mapOption =
  <T, R>(fn: (value: T) => R) =>
  (opt: Option<T>): Option<R> =>
    isSome(opt) ? Some(fn(opt.value)) : None;

/**
 * Chain Options — flatMap that avoids nested Some(Some(x)).
 *
 * @example
 * const safeSqrt = (n: number): Option<number> =>
 *   n >= 0 ? Some(Math.sqrt(n)) : None;
 *
 * pipe(Some(16), flatMapOption(safeSqrt)) // Some(4)
 * pipe(Some(-1), flatMapOption(safeSqrt)) // None
 */
export const flatMapOption =
  <T, R>(fn: (value: T) => Option<R>) =>
  (opt: Option<T>): Option<R> =>
    isSome(opt) ? fn(opt.value) : None;

/** Alias for flatMapOption */
export const andThenOption = flatMapOption;

/**
 * Pattern match over an Option.
 *
 * @example
 * const greet = matchOption(
 *   (name: string) => `Hello, ${name}!`,
 *   () => 'Hello, stranger!',
 * );
 * greet(Some('Alice')); // 'Hello, Alice!'
 * greet(None);          // 'Hello, stranger!'
 */
export const matchOption =
  <T, R>(onSome: (value: T) => R, onNone: () => R) =>
  (opt: Option<T>): R =>
    isSome(opt) ? onSome(opt.value) : onNone();

/** Extracts the value or throws if None. */
export const unwrapOption = <T>(opt: Option<T>): T => {
  if (isSome(opt)) return opt.value;
  throw new Error('Called unwrapOption on a None value');
};

/** Extracts the value or returns `defaultValue` if None. */
export const unwrapOptionOr =
  <T>(defaultValue: T) =>
  (opt: Option<T>): T =>
    isSome(opt) ? opt.value : defaultValue;

/** Extracts the value or computes a fallback if None. */
export const unwrapOptionOrElse =
  <T>(fn: () => T) =>
  (opt: Option<T>): T =>
    isSome(opt) ? opt.value : fn();

/** Returns `opt` if Some, otherwise returns `fallback`. */
export const orElseOption =
  <T>(fallback: () => Option<T>) =>
  (opt: Option<T>): Option<T> =>
    isSome(opt) ? opt : fallback();

/** Converts Option to a nullable value. */
export const toNullable = <T>(opt: Option<T>): T | null => (isSome(opt) ? opt.value : null);

/** Converts Option to an array (empty if None, single-element if Some). */
export const toArray = <T>(opt: Option<T>): T[] => (isSome(opt) ? [opt.value] : []);

// ============================================================================
// COMBINATORS
// ============================================================================

/**
 * Combines two Options — both must be Some.
 *
 * @example
 * zipOption(Some(1), Some('a')) // Some([1, 'a'])
 * zipOption(None,    Some('a')) // None
 */
export const zipOption = <A, B>(a: Option<A>, b: Option<B>): Option<[A, B]> =>
  isSome(a) && isSome(b) ? Some([a.value, b.value]) : None;

/**
 * Collects an array of Options into an Option of array.
 * Returns None if any element is None.
 *
 * @example
 * sequenceOption([Some(1), Some(2), Some(3)]) // Some([1, 2, 3])
 * sequenceOption([Some(1), None,    Some(3)]) // None
 */
export const sequenceOption = <T>(opts: Array<Option<T>>): Option<T[]> => {
  const values: T[] = [];
  for (const opt of opts) {
    if (isNone(opt)) return None;
    values.push(opt.value);
  }
  return Some(values);
};

/**
 * Filters an array of Options, returning only the inner values of Some elements.
 *
 * @example
 * compactOptions([Some(1), None, Some(2), None]) // [1, 2]
 */
export const compactOptions = <T>(opts: Array<Option<T>>): T[] => {
  const result: T[] = [];
  for (const opt of opts) {
    if (isSome(opt)) result.push(opt.value);
  }
  return result;
};

// ============================================================================
// INTEROP WITH RESULT
// ============================================================================

import type { Result } from './result.js';
import { Ok, Err } from './result.js';

/**
 * Converts Option<T> to Result<T, E>.
 *
 * @example
 * optionToResult(() => 'not found')(Some(42))  // Ok(42)
 * optionToResult(() => 'not found')(None)       // Err('not found')
 */
export const optionToResult =
  <T, E>(onNone: () => E) =>
  (opt: Option<T>): Result<T, E> =>
    isSome(opt) ? Ok(opt.value) : Err(onNone());

/**
 * Converts Result<T, E> to Option<T>, discarding the error.
 *
 * @example
 * resultToOption(Ok(42))         // Some(42)
 * resultToOption(Err('oops'))    // None
 */
export const resultToOption = <T, E>(result: Result<T, E>): Option<T> =>
  result.ok ? Some(result.value) : None;
