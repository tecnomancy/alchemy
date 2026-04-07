/**
 * Type-level tests — verify that TypeScript infers correctly at compile time.
 * These tests use vitest's `expectTypeOf` to assert type inference
 * without runtime behavior, ensuring the library's type contracts hold.
 */
import { describe, it, expectTypeOf } from 'vitest';
import { pipe } from '../src/composition.js';
import {
  Ok, Err, isOk, isErr, fromPromise, tryCatch, tryCatchAsync,
  fromPredicate, traverseResult,
  type Result,
} from '../src/result.js';
import {
  Some, None, fromNullable, fromPredicateOption, traverseOption,
  type Option,
} from '../src/option.js';
import { compact } from '../src/array.js';

// ============================================================================
// Result: _tag discriminant
// ============================================================================

describe('Result type-level inference', () => {
  it('Ok has _tag "Ok"', () => {
    const r = Ok(42);
    expectTypeOf(r).toMatchTypeOf<Result<number, Error>>();
    if (isOk(r)) {
      expectTypeOf(r._tag).toEqualTypeOf<'Ok'>();
      expectTypeOf(r.value).toEqualTypeOf<number>();
    }
  });

  it('Err has _tag "Err"', () => {
    const r = Err('fail');
    if (isErr(r)) {
      expectTypeOf(r._tag).toEqualTypeOf<'Err'>();
      expectTypeOf(r.error).toEqualTypeOf<string>();
    }
  });

  it('Result discriminated union narrows via _tag', () => {
    const r: Result<number, string> = Ok(1);
    if (r._tag === 'Ok') {
      expectTypeOf(r.value).toEqualTypeOf<number>();
    } else {
      expectTypeOf(r.error).toEqualTypeOf<string>();
    }
  });
});

// ============================================================================
// Option: _tag discriminant consistency
// ============================================================================

describe('Option type-level inference', () => {
  it('Some has _tag "Some"', () => {
    const o = Some(42);
    expectTypeOf(o).toMatchTypeOf<Option<number>>();
  });

  it('None is Option<never>', () => {
    expectTypeOf(None).toEqualTypeOf<Option<never>>();
  });

  it('fromNullable narrows correctly', () => {
    const o = fromNullable<string>('hello');
    expectTypeOf(o).toEqualTypeOf<Option<string>>();
  });
});

// ============================================================================
// pipe: type inference across steps
// ============================================================================

describe('pipe type inference', () => {
  it('infers through multiple steps', () => {
    const result = pipe(
      5,
      (n: number) => String(n),
      (s: string) => s.length,
      (n: number) => n > 0,
    );
    expectTypeOf(result).toEqualTypeOf<boolean>();
  });

  it('single value passes through', () => {
    const result = pipe(42);
    expectTypeOf(result).toEqualTypeOf<number>();
  });
});

// ============================================================================
// fromPromise: overload inference
// ============================================================================

describe('fromPromise type inference', () => {
  it('without mapper returns Result<T, Error>', () => {
    const p = fromPromise(Promise.resolve(42));
    expectTypeOf(p).toEqualTypeOf<Promise<Result<number, Error>>>();
  });

  it('with mapper returns Result<T, E>', () => {
    const p = fromPromise(Promise.resolve(42), e => e.message);
    expectTypeOf(p).toEqualTypeOf<Promise<Result<number, string>>>();
  });
});

// ============================================================================
// tryCatch / tryCatchAsync: overload inference
// ============================================================================

describe('tryCatch type inference', () => {
  it('without mapper returns Result<R, Error>', () => {
    const safe = tryCatch((n: number) => n * 2);
    const r = safe(5);
    expectTypeOf(r).toEqualTypeOf<Result<number, Error>>();
  });

  it('with mapper returns Result<R, E>', () => {
    const safe = tryCatch((n: number) => n * 2, e => e.message);
    const r = safe(5);
    expectTypeOf(r).toEqualTypeOf<Result<number, string>>();
  });

  it('tryCatchAsync without mapper returns Result<R, Error>', () => {
    const safe = tryCatchAsync(async (n: number) => n * 2);
    const r = safe(5);
    expectTypeOf(r).toEqualTypeOf<Promise<Result<number, Error>>>();
  });

  it('tryCatchAsync with mapper returns Result<R, E>', () => {
    const safe = tryCatchAsync(async (n: number) => n * 2, e => e.message);
    const r = safe(5);
    expectTypeOf(r).toEqualTypeOf<Promise<Result<number, string>>>();
  });
});

// ============================================================================
// New combinators: fromPredicate, traverse
// ============================================================================

describe('combinator type inference', () => {
  it('fromPredicate infers T and E', () => {
    const isPositive = fromPredicate(
      (n: number) => n > 0,
      (n: number) => `${n} is not positive`,
    );
    const r = isPositive(5);
    expectTypeOf(r).toEqualTypeOf<Result<number, string>>();
  });

  it('traverseResult infers array element types', () => {
    const fn = (s: string): Result<number, string> => Ok(Number(s));
    const r = traverseResult(fn)(['1', '2']);
    expectTypeOf(r).toEqualTypeOf<Result<number[], string>>();
  });

  it('traverseOption infers array element types', () => {
    const fn = (n: number): Option<string> => Some(String(n));
    const r = traverseOption(fn)([1, 2]);
    expectTypeOf(r).toEqualTypeOf<Option<string[]>>();
  });

  it('fromPredicateOption infers T', () => {
    const positive = fromPredicateOption((n: number) => n > 0);
    const r = positive(5);
    expectTypeOf(r).toEqualTypeOf<Option<number>>();
  });
});

// ============================================================================
// compact: type narrowing
// ============================================================================

describe('compact type narrowing', () => {
  it('removes falsy types from union', () => {
    const arr: Array<number | null | undefined | false | 0 | ''> = [1, null, 2, undefined, 0, false, '', 3];
    const result = compact(arr);
    expectTypeOf(result).toEqualTypeOf<number[]>();
  });
});
