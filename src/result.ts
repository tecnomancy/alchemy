/**
 * Result/Either type for functional error handling
 * Inspired by Rust's Result<T, E> and Haskell's Either
 * @module result
 */

// ============================================================================
// RESULT TYPE
// ============================================================================

/**
 * Branded Ok variant — success branch of a Result.
 */
export type Ok<T> = { readonly _tag: 'Ok'; readonly ok: true; readonly value: T };

/**
 * Branded Err variant — failure branch of a Result.
 */
export type Err<E> = { readonly _tag: 'Err'; readonly ok: false; readonly error: E };

/**
 * Result type — represents success (Ok) or failure (Err).
 * Uses `_tag` discriminant for structural consistency with Option.
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

// ============================================================================
// CONSTRUCTORS
// ============================================================================

/**
 * Creates a successful Result
 *
 * @example
 * const result = Ok(42);
 * // { _tag: 'Ok', ok: true, value: 42 }
 */
export const Ok = <T, E = Error>(value: T): Result<T, E> => ({
  _tag: 'Ok',
  ok: true,
  value,
});

/**
 * Creates a failed Result
 *
 * @example
 * const result = Err(new Error('Failed'));
 * // { _tag: 'Err', ok: false, error: Error(...) }
 */
export const Err = <T, E = Error>(error: E): Result<T, E> => ({
  _tag: 'Err',
  ok: false,
  error,
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Checks if Result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result._tag === 'Ok';

/**
 * Checks if Result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  result._tag === 'Err';

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

/**
 * Map over Result value (only if Ok). Use for **pure** transforms (`T → R`).
 *
 * > **When to use `flatMap` instead:**
 * > If your transform itself returns a `Result<R, E>`, use {@link flatMap} —
 * > `mapResult` would produce a double-nested `Result<Result<R,E>, E>`.
 * >
 * > ```ts
 * > // Pure transform — mapResult:
 * > pipe(Ok(5), mapResult(x => x * 2))           // Ok(10)
 * >
 * > // Fallible transform — flatMap:
 * > pipe(Ok(data), flatMap(parseField('name')))   // Ok(name) | Err(...)
 * > ```
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
 * Extracts the value if Ok, otherwise returns the provided default
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
 * Extracts the value if Ok, otherwise computes a fallback from the error
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
 * Pattern match on a Result — apply one of two functions depending on Ok/Err
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
 * Lift a 2-argument function to operate on two `Result` values.
 * Returns `Ok(fn(a, b))` if both are `Ok`, otherwise returns the first `Err`.
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * liftA2(add)(Ok(3), Ok(4));    // Ok(7)
 * liftA2(add)(Err('x'), Ok(4)); // Err('x')
 * liftA2(add)(Ok(3), Err('y')); // Err('y')
 */
export const liftA2 =
  <T1, T2, R, E>(fn: (v1: T1, v2: T2) => R) =>
  (r1: Result<T1, E>, r2: Result<T2, E>): Result<R, E> => {
    if (isErr(r1)) return r1;
    if (isErr(r2)) return r2;
    return Ok(fn(r1.value, r2.value));
  };

/**
 * @deprecated Use {@link liftA2} instead.
 */
export const combineTwo = liftA2;

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
 * // Err(['e1', 'e2']) if there are errors
 * // Ok([1, 2]) if all Ok
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

/** Normalizes an unknown thrown value into an Error. */
const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

/**
 * Converts a Promise to a Result.
 *
 * Without an error mapper, the error type is `Error` (no unsafe cast).
 * With an error mapper, you control the error type precisely.
 *
 * @example
 * // Error type is Error (safe default)
 * const result = await fromPromise(fetch('/api/data'));
 *
 * // Custom error type via mapper
 * const result = await fromPromise(fetch('/api'), e => e.message);
 */
export function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>>;
export function fromPromise<T, E>(promise: Promise<T>, mapError: (e: Error) => E): Promise<Result<T, E>>;
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  mapError?: (e: Error) => E,
): Promise<Result<T, E>> {
  try {
    return Ok(await promise);
  } catch (error) {
    const normalized = normalizeError(error);
    return Err((mapError ? mapError(normalized) : normalized) as E);
  }
}

/**
 * Wraps a throwing function into one that returns Result.
 *
 * Without an error mapper, errors are normalized to `Error`.
 * With an error mapper, you control the error type precisely.
 *
 * @example
 * const safeDivide = tryCatch((x: number, y: number) => {
 *   if (y === 0) throw new Error('Division by zero');
 *   return x / y;
 * });
 * safeDivide(10, 0); // Err(Error('Division by zero'))
 * safeDivide(10, 2); // Ok(5)
 *
 * // With custom error type
 * const safe = tryCatch(parse, e => e.message);
 * safe(input); // Result<T, string>
 */
export function tryCatch<T extends unknown[], R>(
  fn: (...args: T) => R,
): (...args: T) => Result<R, Error>;
export function tryCatch<T extends unknown[], R, E>(
  fn: (...args: T) => R,
  mapError: (e: Error) => E,
): (...args: T) => Result<R, E>;
export function tryCatch<T extends unknown[], R, E = Error>(
  fn: (...args: T) => R,
  mapError?: (e: Error) => E,
): (...args: T) => Result<R, E> {
  return (...args: T): Result<R, E> => {
    try {
      return Ok(fn(...args));
    } catch (error) {
      const normalized = normalizeError(error);
      return Err((mapError ? mapError(normalized) : normalized) as E);
    }
  };
}

// ============================================================================
// BIMAP / MAPBOTH
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
 * Wraps an async throwing function into one that returns Promise<Result>.
 *
 * Without an error mapper, errors are normalized to `Error`.
 * With an error mapper, you control the error type precisely.
 *
 * @example
 * const safeFetch = tryCatchAsync(async (id: string) => {
 *   const res = await fetch(`/users/${id}`);
 *   if (!res.ok) throw new Error('Not found');
 *   return res.json();
 * });
 * await safeFetch('123'); // Result<User, Error>
 *
 * // With custom error type
 * const safe = tryCatchAsync(fetchUser, e => e.message);
 * await safe('123'); // Result<User, string>
 */
export function tryCatchAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
): (...args: T) => Promise<Result<R, Error>>;
export function tryCatchAsync<T extends unknown[], R, E>(
  fn: (...args: T) => Promise<R>,
  mapError: (e: Error) => E,
): (...args: T) => Promise<Result<R, E>>;
export function tryCatchAsync<T extends unknown[], R, E = Error>(
  fn: (...args: T) => Promise<R>,
  mapError?: (e: Error) => E,
): (...args: T) => Promise<Result<R, E>> {
  return async (...args: T): Promise<Result<R, E>> => {
    try {
      return Ok(await fn(...args));
    } catch (error) {
      const normalized = normalizeError(error);
      return Err((mapError ? mapError(normalized) : normalized) as E);
    }
  };
}

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

// ============================================================================
// ADDITIONAL COMBINATORS
// ============================================================================

/**
 * Alias for flatMap — standard FP name (Fantasy Land, fp-ts).
 */
export const chain = flatMap;

/**
 * Alias for combineAll — standard FP name for collecting an array of Results.
 */
export const sequenceResult = combineAll;

/**
 * Lifts a predicate into a Result. Returns Ok if the predicate holds,
 * otherwise Err with the value produced by `onFalse`.
 *
 * @example
 * const isPositive = fromPredicate(
 *   (n: number) => n > 0,
 *   n => `${n} is not positive`,
 * );
 * isPositive(5);  // Ok(5)
 * isPositive(-1); // Err('-1 is not positive')
 */
export const fromPredicate =
  <T, E>(predicate: (value: T) => boolean, onFalse: (value: T) => E) =>
  (value: T): Result<T, E> =>
    predicate(value) ? Ok(value) : Err(onFalse(value));

/**
 * Maps each element through a Result-returning function and collects
 * all Ok values. Short-circuits on the first Err (fail-fast).
 *
 * More efficient than `map(fn) |> combineAll` because it avoids
 * building the intermediate Result array.
 *
 * @example
 * const parseNum = (s: string): Result<number, string> => {
 *   const n = Number(s);
 *   return isNaN(n) ? Err(`"${s}" is not a number`) : Ok(n);
 * };
 *
 * traverseResult(parseNum)(['1', '2', '3']); // Ok([1, 2, 3])
 * traverseResult(parseNum)(['1', 'x', '3']); // Err('"x" is not a number')
 */
export const traverseResult =
  <T, R, E>(fn: (value: T) => Result<R, E>) =>
  (arr: T[]): Result<R[], E> => {
    const values: R[] = [];
    for (const item of arr) {
      const result = fn(item);
      if (isErr(result)) return result;
      values.push(result.value);
    }
    return Ok(values);
  };
