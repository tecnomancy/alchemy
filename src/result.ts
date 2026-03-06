/**
 * Result/Either type for functional error handling
 * Inspired by Rust's Result<T, E> and Haskell's Either
 * @module result
 */

import type { Option } from './option.js';
import { Some, None } from './option.js';

// ============================================================================
// RESULT TYPE
// ============================================================================

/**
 * Result type - represents success (Ok) or failure (Err)
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ============================================================================
// CONSTRUCTORS
// ============================================================================

/**
 * Creates a successful Result
 *
 * @example
 * const result = Ok(42);
 * // { ok: true, value: 42 }
 */
export const Ok = <T, E = Error>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

/**
 * Creates a failed Result
 *
 * @example
 * const result = Err(new Error('Failed'));
 * // { ok: false, error: Error(...) }
 */
export const Err = <T, E = Error>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Checks if Result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
  result.ok === true;

/**
 * Checks if Result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
  result.ok === false;

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

/**
 * Map over Result value (only if Ok)
 *
 * @example
 * const result = Ok(5);
 * const doubled = mapResult((x: number) => x * 2)(result);
 * // Ok(10)
 */
export const mapResult =
  <T, R, E>(fn: (value: T) => R) =>
  (result: Result<T, E>): Result<R, E> =>
    isOk(result) ? Ok(fn(result.value)) : result;

/**
 * Map over Result error (only if Err)
 *
 * @example
 * const result = Err(new Error('Failed'));
 * const mapped = mapErr((e: Error) => e.message)(result);
 * // Err('Failed')
 */
export const mapErr =
  <T, E, F>(fn: (error: E) => F) =>
  (result: Result<T, E>): Result<T, F> =>
    isErr(result) ? Err(fn(result.error)) : result;

/**
 * FlatMap (bind/chain) — chains operations that return Result
 *
 * @example
 * const divide = (x: number, y: number): Result<number, string> =>
 *   y === 0 ? Err('Division by zero') : Ok(x / y);
 *
 * const result = flatMap((x: number) => divide(x, 2))(Ok(10));
 * // Ok(5)
 */
export const flatMap =
  <T, R, E>(fn: (value: T) => Result<R, E>) =>
  (result: Result<T, E>): Result<R, E> =>
    isOk(result) ? fn(result.value) : result;

/**
 * Alias for flatMap
 */
export const andThen = flatMap;

/**
 * Unwrap — extracts the value or throws the error
 *
 * @example
 * unwrap(Ok(42)); // 42
 * unwrap(Err(new Error('Failed'))); // Throws Error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw result.error;
};

/**
 * UnwrapOr - extrai valor ou retorna default
 *
 * @example
 * unwrapOr(0)(Ok(42)); // 42
 * unwrapOr(0)(Err(new Error('Failed'))); // 0
 */
export const unwrapOr =
  <T, E>(defaultValue: T) =>
  (result: Result<T, E>): T =>
    isOk(result) ? result.value : defaultValue;

/**
 * UnwrapOrElse - extrai valor ou computa default
 *
 * @example
 * const getDefault = (e: Error) => {
 *   console.error(e);
 *   return 0;
 * };
 * unwrapOrElse(getDefault)(result);
 */
export const unwrapOrElse =
  <T, E>(fn: (error: E) => T) =>
  (result: Result<T, E>): T =>
    isOk(result) ? result.value : fn(result.error);

/**
 * Match - pattern matching sobre Result
 *
 * @example
 * const result = Ok(42);
 * const message = match(
 *   (value) => `Success: ${value}`,
 *   (error) => `Error: ${error}`
 * )(result);
 * // 'Success: 42'
 */
export const match =
  <T, E, R>(onOk: (value: T) => R, onErr: (error: E) => R) =>
  (result: Result<T, E>): R =>
    isOk(result) ? onOk(result.value) : onErr(result.error);

/**
 * Executes a side-effect on the value if Ok, then passes the Result through unchanged.
 * Useful for logging inside a pipe without breaking the chain.
 *
 * @example
 * pipe(
 *   Ok(42),
 *   tapResult(value => console.log('got:', value)), // logs 'got: 42'
 *   mapResult(n => n * 2),
 * ); // Ok(84)
 */
export const tapResult =
  <T, E>(fn: (value: T) => void) =>
  (result: Result<T, E>): Result<T, E> => {
    if (isOk(result)) fn(result.value);
    return result;
  };

/**
 * Executes a side-effect on the error if Err, then passes the Result through unchanged.
 *
 * @example
 * pipe(
 *   Err('oops'),
 *   tapError(e => console.error('error:', e)), // logs 'error: oops'
 *   mapResult(n => n * 2),
 * ); // Err('oops')
 */
export const tapError =
  <T, E>(fn: (error: E) => void) =>
  (result: Result<T, E>): Result<T, E> => {
    if (isErr(result)) fn(result.error);
    return result;
  };

/**
 * Recovers from an Err by applying `fn` to produce an alternative Result.
 * If Ok, passes through unchanged.
 *
 * @example
 * const fallback = orElse((e: string) => Ok(0));
 * fallback(Ok(42));    // Ok(42)
 * fallback(Err('x'));  // Ok(0)
 */
export const orElse =
  <T, E, F>(fn: (error: E) => Result<T, F>) =>
  (result: Result<T, E>): Result<T, F> =>
    isErr(result) ? fn(result.error) : result;

/**
 * Lifts a nullable value into a Result, using `onNone` to produce the error.
 *
 * @example
 * const fromId = fromNullableResult(() => 'not found');
 * fromId(42);        // Ok(42)
 * fromId(null);      // Err('not found')
 * fromId(undefined); // Err('not found')
 */
export const fromNullableResult =
  <E>(onNone: () => E) =>
  <T>(value: T | null | undefined): Result<T, E> =>
    value == null ? Err(onNone()) : Ok(value);

// ============================================================================
// COMBINATORS
// ============================================================================

/**
 * Combines two Results - both must be Ok
 *
 * @example
 * const r1 = Ok(5);
 * const r2 = Ok(10);
 * const combined = combineTwo((a, b) => a + b)(r1, r2);
 * // Ok(15)
 */
export const combineTwo =
  <T1, T2, R, E>(fn: (v1: T1, v2: T2) => R) =>
  (r1: Result<T1, E>, r2: Result<T2, E>): Result<R, E> => {
    if (isErr(r1)) return r1;
    if (isErr(r2)) return r2;
    return Ok(fn(r1.value, r2.value));
  };

/**
 * Combines array of Results - all must be Ok
 *
 * @example
 * const results = [Ok(1), Ok(2), Ok(3)];
 * const combined = combineAll(results);
 * // Ok([1, 2, 3])
 */
export const combineAll = <T, E>(results: Array<Result<T, E>>): Result<T[], E> => {
  const values: T[] = [];

  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.value);
  }

  return Ok(values);
};

/**
 * Apply a wrapped function to a wrapped value (applicative `<*>`).
 * If either argument is `Err`, the first `Err` is returned.
 *
 * @example
 * const double = (n: number) => n * 2;
 * ap(Ok(double))(Ok(5));    // Ok(10)
 * ap(Err('no fn'))(Ok(5));  // Err('no fn')
 * ap(Ok(double))(Err('e')); // Err('e')
 *
 * // Combine independent results using curried functions:
 * const add = (a: number) => (b: number) => a + b;
 * ap(mapResult(add)(Ok(3)))(Ok(4)); // Ok(7)
 */
export const ap =
  <T, U, E>(resultFn: Result<(a: T) => U, E>) =>
  (result: Result<T, E>): Result<U, E> => {
    if (isErr(resultFn)) return resultFn;
    if (isErr(result)) return result;
    return Ok(resultFn.value(result.value));
  };

/**
 * Lift a 2-argument function to operate on two `Result` values.
 * Returns `Ok(fn(a, b))` if both are `Ok`, otherwise returns the first `Err`.
 *
 * Alias for {@link combineTwo}.
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * liftA2(add)(Ok(3), Ok(4));    // Ok(7)
 * liftA2(add)(Err('x'), Ok(4)); // Err('x')
 * liftA2(add)(Ok(3), Err('y')); // Err('y')
 */
export const liftA2 = combineTwo;

/**
 * Lift a 3-argument function to operate on three `Result` values.
 * Returns `Ok(fn(a, b, c))` if all are `Ok`, otherwise returns the first `Err`.
 *
 * @example
 * const sum3 = (a: number, b: number, c: number) => a + b + c;
 * liftA3(sum3)(Ok(1), Ok(2), Ok(3));    // Ok(6)
 * liftA3(sum3)(Err('x'), Ok(2), Ok(3)); // Err('x')
 * liftA3(sum3)(Ok(1), Err('y'), Ok(3)); // Err('y')
 */
export const liftA3 =
  <A, B, C, D, E>(fn: (a: A, b: B, c: C) => D) =>
  (ra: Result<A, E>, rb: Result<B, E>, rc: Result<C, E>): Result<D, E> => {
    if (isErr(ra)) return ra;
    if (isErr(rb)) return rb;
    if (isErr(rc)) return rc;
    return Ok(fn(ra.value, rb.value, rc.value));
  };

/**
 * Collects all errors from an array of Results
 *
 * @example
 * const results = [Ok(1), Err('e1'), Ok(2), Err('e2')];
 * const combined = collectErrors(results);
 * // Err(['e1', 'e2']) se houver erros
 * // Ok([1, 2]) se todos Ok
 */
export const collectErrors = <T, E>(results: Array<Result<T, E>>): Result<T[], E[]> => {
  const values: T[] = [];
  const errors: E[] = [];

  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value);
    } else {
      errors.push(result.error);
    }
  }

  return errors.length > 0 ? Err(errors) : Ok(values);
};

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Converts a Promise to a Result
 *
 * @example
 * const result = await fromPromise(fetch('/api/data'));
 * // Ok(response) ou Err(error)
 */
export const fromPromise = async <T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (error) {
    return Err(error as E);
  }
};

/**
 * Converts a throwing function into one that returns Result
 *
 * @example
 * const divide = (x: number, y: number) => {
 *   if (y === 0) throw new Error('Division by zero');
 *   return x / y;
 * };
 *
 * const safeDivide = tryCatch(divide);
 * safeDivide(10, 0); // Err(Error('Division by zero'))
 * safeDivide(10, 2); // Ok(5)
 */
export const tryCatch =
  <T extends unknown[], R, E = Error>(fn: (...args: T) => R) =>
  (...args: T): Result<R, E> => {
    try {
      return Ok(fn(...args));
    } catch (error) {
      return Err(error as E);
    }
  };

// ============================================================================
// OPTION INTEROP
// ============================================================================

/**
 * Transform both branches of a Result simultaneously.
 * Applies `onOk` if Ok, or `onErr` if Err.
 *
 * @example
 * bimap((n: number) => n * 2, (e: string) => e.toUpperCase())(Ok(5));   // Ok(10)
 * bimap((n: number) => n * 2, (e: string) => e.toUpperCase())(Err('fail')); // Err('FAIL')
 */
export const bimap =
  <T, E, U, F>(onOk: (v: T) => U, onErr: (e: E) => F) =>
  (result: Result<T, E>): Result<U, F> =>
    isOk(result) ? Ok(onOk(result.value)) : Err(onErr(result.error));

/**
 * Alias for `mapErr` — transforms the error value if Err, passes Ok through.
 * Provided for fp-ts / fantasy-land compatibility.
 *
 * @example
 * mapLeft((e: string) => e.toUpperCase())(Err('oops')); // Err('OOPS')
 * mapLeft((e: string) => e.toUpperCase())(Ok(1));       // Ok(1)
 */
export const mapLeft = mapErr;

/**
 * Swap Ok and Err — Ok becomes Err, Err becomes Ok.
 *
 * @example
 * swap(Ok(1));      // Err(1)
 * swap(Err('e'));   // Ok('e')
 */
export const swap = <T, E>(result: Result<T, E>): Result<E, T> =>
  isOk(result) ? Err(result.value) : Ok(result.error);

/**
 * Convert a Result to an Option, discarding the error on Err.
 *
 * @example
 * toOption(Ok(42));      // Some(42)
 * toOption(Err('oops')); // None
 */
export const toOption = <T, E>(result: Result<T, E>): Option<T> =>
  isOk(result) ? Some(result.value) : None;

/**
 * Async version of tryCatch
 *
 * @example
 * const fetchUser = async (id: string) => {
 *   const res = await fetch(`/users/${id}`);
 *   if (!res.ok) throw new Error('Not found');
 *   return res.json();
 * };
 *
 * const safeFetch = tryCatchAsync(fetchUser);
 * await safeFetch('123'); // Result<User, Error>
 */
export const tryCatchAsync =
  <T extends unknown[], R, E = Error>(fn: (...args: T) => Promise<R>) =>
  async (...args: T): Promise<Result<R, E>> => {
    try {
      const value = await fn(...args);
      return Ok(value);
    } catch (error) {
      return Err(error as E);
    }
  };

/**
 * Async map over Result
 *
 * @example
 * const result = Ok(5);
 * const doubled = await mapResultAsync(async (x: number) => x * 2)(result);
 * // Ok(10)
 */
export const mapResultAsync =
  <T, R, E>(fn: (value: T) => Promise<R>) =>
  async (result: Result<T, E>): Promise<Result<R, E>> =>
    isOk(result) ? Ok(await fn(result.value)) : result;

/**
 * Async FlatMap over Result
 *
 * @example
 * const fetchUser = async (id: string): Promise<Result<User, Error>> => {
 *   // ...
 * };
 *
 * const result = Ok('user-123');
 * const user = await flatMapAsync(fetchUser)(result);
 */
export const flatMapAsync =
  <T, R, E>(fn: (value: T) => Promise<Result<R, E>>) =>
  async (result: Result<T, E>): Promise<Result<R, E>> =>
    isOk(result) ? fn(result.value) : result;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Creates a validator that returns Result
 *
 * @example
 * const validateAge = (age: number): Result<number, string> =>
 *   age >= 18 ? Ok(age) : Err('Must be 18 or older');
 *
 * validateAge(25); // Ok(25)
 * validateAge(15); // Err('Must be 18 or older')
 */
export type Validator<T, E = string> = (value: T) => Result<T, E>;

/**
 * Combines multiple validators — all must pass (fail-fast).
 *
 * @param validators - Array of validator functions. Checked in order; the first
 *   failure short-circuits and its error is returned immediately.
 * @returns `Ok(value)` when all validators pass; `Err(E)` from the first
 *   failing validator.
 *
 * @example
 * const isPositive: Validator<number> = (x) =>
 *   x > 0 ? Ok(x) : Err('Must be positive');
 *
 * const isEven: Validator<number> = (x) =>
 *   x % 2 === 0 ? Ok(x) : Err('Must be even');
 *
 * const validate = validateAll([isPositive, isEven]);
 * validate(4); // Ok(4)
 * validate(3); // Err('Must be even')
 * validate(-2); // Err('Must be positive')
 */
export const validateAll =
  <T, E>(validators: Array<Validator<T, E>>) =>
  (value: T): Result<T, E> => {
    for (const validator of validators) {
      const result = validator(value);
      if (isErr(result)) {
        return result;
      }
    }
    return Ok(value);
  };

/**
 * Combines multiple validators — at least one must pass.
 *
 * @param validators - Array of validator functions. Checked in order; the first
 *   success short-circuits and `Ok(value)` is returned.
 * @returns `Ok(value)` when any validator passes; `Err(E[])` collecting every
 *   error when all validators fail (last error is the last validator's error).
 *
 * @example
 * const isZero: Validator<number> = (x) =>
 *   x === 0 ? Ok(x) : Err('Not zero');
 *
 * const isPositive: Validator<number> = (x) =>
 *   x > 0 ? Ok(x) : Err('Not positive');
 *
 * const validate = validateAny([isZero, isPositive]);
 * validate(5); // Ok(5)
 * validate(0); // Ok(0)
 * validate(-1); // Err(['Not zero', 'Not positive'])
 */
export const validateAny =
  <T, E>(validators: Array<Validator<T, E>>) =>
  (value: T): Result<T, E[]> => {
    const errors: E[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (isOk(result)) {
        return Ok(value);
      }
      errors.push(result.error);
    }

    return Err(errors);
  };

/**
 * Runs all validators and collects every failure (error accumulation).
 * Unlike `validateAll` (fail-fast), all validators are always executed so
 * every error is reported at once — useful for form validation.
 *
 * @param validators - Array of validator functions. All are executed regardless
 *   of earlier failures.
 * @returns `Ok(value)` when all validators pass; `Err(E[])` containing every
 *   error from every failing validator, in order.
 *
 * @example
 * const isPositive: Validator<number> = (x) =>
 *   x > 0 ? Ok(x) : Err('Must be positive');
 *
 * const isEven: Validator<number> = (x) =>
 *   x % 2 === 0 ? Ok(x) : Err('Must be even');
 *
 * const validate = validateCollect([isPositive, isEven]);
 * validate(4);  // Ok(4)
 * validate(3);  // Err(['Must be even'])
 * validate(-3); // Err(['Must be positive', 'Must be even'])
 */
export const validateCollect =
  <T, E>(validators: Array<Validator<T, E>>) =>
  (value: T): Result<T, E[]> => {
    const errors: E[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (isErr(result)) {
        errors.push(result.error);
      }
    }

    return errors.length === 0 ? Ok(value) : Err(errors);
  };
