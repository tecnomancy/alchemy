import { describe, it, expect, vi } from 'vitest';
import {
  Ok, Err,
  isOk, isErr,
  mapResult, mapErr,
  flatMap, andThen,
  match,
  unwrap, unwrapOr, unwrapOrElse,
  combineAll, combineTwo, collectErrors,
  tryCatch, tryCatchAsync,
  fromPromise,
  validateAll, validateAny, validateCollect,
  mapResultAsync, flatMapAsync,
  tapResult, tapError, orElse, fromNullableResult,
  bimap, mapLeft, swap, toOption,
  ap, liftA2, liftA3,
  type Result,
} from '../src/result.js';
import { Some, None } from '../src/option.js';

describe('Result — constructors', () => {
  it('Ok creates a success', () => {
    const r = Ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('Err creates a failure', () => {
    const r = Err('oops');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('oops');
  });
});

describe('Result — type guards', () => {
  it('isOk / isErr narrow the type', () => {
    expect(isOk(Ok(1))).toBe(true);
    expect(isOk(Err('x'))).toBe(false);
    expect(isErr(Err('x'))).toBe(true);
    expect(isErr(Ok(1))).toBe(false);
  });
});

describe('Result — transformations', () => {
  it('mapResult transforms Ok value', () => {
    expect(unwrap(mapResult((n: number) => n * 2)(Ok(5)))).toBe(10);
  });

  it('mapResult passes Err through', () => {
    const r = mapResult((n: number) => n * 2)(Err<number, string>('e'));
    expect(isErr(r)).toBe(true);
  });

  it('mapErr transforms Err value', () => {
    const r = mapErr((e: string) => e.toUpperCase())(Err<number, string>('oops'));
    if (!r.ok) expect(r.error).toBe('OOPS');
  });

  it('mapErr passes Ok through unchanged', () => {
    const fn = vi.fn((e: string) => e.toUpperCase());
    const r = mapErr(fn)(Ok<number, string>(42));
    expect(isOk(r)).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flatMap chains Ok results', () => {
    const divide = (n: number): Result<number, string> =>
      n === 0 ? Err('zero') : Ok(100 / n);
    expect(unwrap(flatMap(divide)(Ok<number, string>(5)))).toBe(20);
  });

  it('flatMap short-circuits on Err', () => {
    const r = flatMap((n: number): Result<number, string> => Ok(n * 2))(
      Err<number, string>('e'),
    );
    expect(isErr(r)).toBe(true);
  });

  it('andThen is an alias for flatMap', () => {
    expect(unwrap(andThen((n: number): Result<number, string> => Ok(n + 1))(Ok<number, string>(9)))).toBe(10);
  });
});

describe('Result — match', () => {
  it('calls onOk branch', () => {
    const msg = match((v: number) => `ok:${v}`, (e: string) => `err:${e}`)(Ok<number, string>(42));
    expect(msg).toBe('ok:42');
  });

  it('calls onErr branch', () => {
    const msg = match((v: number) => `ok:${v}`, (e: string) => `err:${e}`)(Err<number, string>('boom'));
    expect(msg).toBe('err:boom');
  });
});

describe('Result — unwrap variants', () => {
  it('unwrap extracts Ok value', () => {
    expect(unwrap(Ok(7))).toBe(7);
  });

  it('unwrap throws on Err', () => {
    expect(() => unwrap(Err(new Error('fail')))).toThrow('fail');
  });

  it('unwrapOr returns default on Err', () => {
    expect(unwrapOr(0)(Err<number, string>('x'))).toBe(0);
    expect(unwrapOr(0)(Ok(99))).toBe(99);
  });

  it('unwrapOrElse computes fallback', () => {
    expect(unwrapOrElse((e: string) => e.length)(Err<number, string>('abc'))).toBe(3);
  });

  it('unwrapOrElse extracts Ok value directly', () => {
    expect(unwrapOrElse((_e: string) => 0)(Ok<number, string>(99))).toBe(99);
  });
});

describe('Result — combinators', () => {
  it('combineAll returns Ok of all values', () => {
    expect(unwrap(combineAll([Ok<number, string>(1), Ok<number, string>(2), Ok<number, string>(3)]))).toEqual([1, 2, 3]);
  });

  it('combineAll fails on first Err', () => {
    const r = combineAll([Ok<number, string>(1), Err<number, string>('e1'), Ok<number, string>(3)]);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('e1');
  });

  it('combineTwo merges two Ok values', () => {
    const r = combineTwo((a: number, b: number) => a + b)(Ok<number, string>(3), Ok<number, string>(4));
    expect(unwrap(r)).toBe(7);
  });

  it('combineTwo short-circuits on first Err', () => {
    const r = combineTwo((a: number, b: number) => a + b)(Err<number, string>('e1'), Ok<number, string>(4));
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('e1');
  });

  it('combineTwo short-circuits on second Err', () => {
    const r = combineTwo((a: number, b: number) => a + b)(Ok<number, string>(3), Err<number, string>('e2'));
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('e2');
  });

  it('collectErrors collects all errors', () => {
    const r = collectErrors([Ok<number, string>(1), Err<number, string>('e1'), Ok<number, string>(2), Err<number, string>('e2')]);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toEqual(['e1', 'e2']);
  });

  it('collectErrors returns Ok if no errors', () => {
    const r = collectErrors([Ok<number, string>(1), Ok<number, string>(2)]);
    expect(unwrap(r)).toEqual([1, 2]);
  });
});

describe('Result — async', () => {
  it('fromPromise resolves to Ok', async () => {
    const r = await fromPromise(Promise.resolve(42));
    expect(unwrap(r)).toBe(42);
  });

  it('fromPromise rejects to Err', async () => {
    const r = await fromPromise(Promise.reject(new Error('oops')));
    expect(isErr(r)).toBe(true);
  });

  it('tryCatch wraps throwing function', () => {
    const safe = tryCatch(JSON.parse);
    expect(isOk(safe('{"a":1}'))).toBe(true);
    expect(isErr(safe('bad json'))).toBe(true);
  });

  it('tryCatchAsync wraps async throwing function', async () => {
    const safe = tryCatchAsync(async (s: string) => JSON.parse(s));
    expect(isOk(await safe('{"a":1}'))).toBe(true);
    expect(isErr(await safe('bad'))).toBe(true);
  });
});

describe('Result — validation', () => {
  const isPositive = (n: number): Result<number, string> =>
    n > 0 ? Ok(n) : Err('not positive');
  const isEven = (n: number): Result<number, string> =>
    n % 2 === 0 ? Ok(n) : Err('not even');

  it('validateAll passes all validators', () => {
    expect(isOk(validateAll([isPositive, isEven])(4))).toBe(true);
  });

  it('validateAll fails on first invalid', () => {
    const r = validateAll([isPositive, isEven])(3);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('not even');
  });

  it('validateAny passes if at least one validator succeeds', () => {
    expect(isOk(validateAny([isPositive, isEven])(3))).toBe(true);
  });

  it('validateAny fails if all validators fail', () => {
    expect(isErr(validateAny([isPositive, isEven])(-3))).toBe(true);
  });

  it('validateCollect returns Ok when all pass', () => {
    expect(isOk(validateCollect([isPositive, isEven])(4))).toBe(true);
  });

  it('validateCollect collects all errors without short-circuiting', () => {
    const r = validateCollect([isPositive, isEven])(-3);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toEqual(['not positive', 'not even']);
  });

  it('validateCollect collects only failing validators', () => {
    const r = validateCollect([isPositive, isEven])(3);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toEqual(['not even']);
  });
});

describe('mapResultAsync', () => {
  it('transforms the value of Ok asynchronously', async () => {
    const result = await mapResultAsync(async (n: number) => n * 2)(Ok<number, string>(5));
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe(10);
  });

  it('passes Err through without calling the function', async () => {
    const fn = vi.fn(async (n: number) => n * 2);
    const result = await mapResultAsync(fn)(Err<number, string>('oops'));
    expect(isErr(result)).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('flatMapAsync', () => {
  const safeSqrt = async (n: number): Promise<Result<number, string>> =>
    n >= 0 ? Ok(Math.sqrt(n)) : Err('negative');

  it('chains an async Result-returning function on Ok', async () => {
    const result = await flatMapAsync(safeSqrt)(Ok<number, string>(16));
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe(4);
  });

  it('short-circuits on Err without calling the function', async () => {
    const fn = vi.fn(async (n: number): Promise<Result<number, string>> => Ok(n));
    const result = await flatMapAsync(fn)(Err<number, string>('already failed'));
    expect(isErr(result)).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it('propagates Err returned by the chained function', async () => {
    const result = await flatMapAsync(safeSqrt)(Ok<number, string>(-1));
    expect(isErr(result)).toBe(true);
  });
});

describe('tapResult', () => {
  it('calls side-effect on Ok and passes value through', () => {
    const log = vi.fn();
    const r = tapResult<number, string>(log)(Ok(42));
    expect(log).toHaveBeenCalledWith(42);
    expect(isOk(r)).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('does not call side-effect on Err', () => {
    const log = vi.fn();
    const r = tapResult<number, string>(log)(Err('oops'));
    expect(log).not.toHaveBeenCalled();
    expect(isErr(r)).toBe(true);
  });
});

describe('tapError', () => {
  it('calls side-effect on Err and passes error through', () => {
    const log = vi.fn();
    const r = tapError<number, string>(log)(Err('oops'));
    expect(log).toHaveBeenCalledWith('oops');
    expect(isErr(r)).toBe(true);
  });

  it('does not call side-effect on Ok', () => {
    const log = vi.fn();
    const r = tapError<number, string>(log)(Ok(42));
    expect(log).not.toHaveBeenCalled();
    expect(isOk(r)).toBe(true);
  });
});

describe('orElse', () => {
  it('passes Ok through unchanged', () => {
    const r = orElse((_e: string) => Ok(0))(Ok<number, string>(42));
    expect(isOk(r)).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('recovers from Err by producing a new Result', () => {
    const r = orElse((e: string) => Ok(e.length))(Err<number, string>('oops'));
    expect(isOk(r)).toBe(true);
    if (r.ok) expect(r.value).toBe(4);
  });

  it('can recover to another Err', () => {
    const r = orElse((_e: string) => Err(404))(Err<number, string>('not found'));
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe(404);
  });
});

describe('fromNullableResult', () => {
  const lift = fromNullableResult<string>(() => 'missing');

  it('wraps a non-null value in Ok', () => {
    const r = lift(42);
    expect(isOk(r)).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('returns Err for null', () => {
    const r = lift(null);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('missing');
  });

  it('returns Err for undefined', () => {
    const r = lift(undefined);
    expect(isErr(r)).toBe(true);
  });
});

describe('bimap', () => {
  it('maps Ok value', () => expect(bimap((n: number) => n * 2, (e: string) => e.toUpperCase())(Ok(5))).toEqual(Ok(10)));
  it('maps Err value', () => expect(bimap((n: number) => n * 2, (e: string) => e.toUpperCase())(Err('fail'))).toEqual(Err('FAIL')));
});

describe('mapLeft', () => {
  it('is an alias for mapErr — transforms Err', () => expect(mapLeft((e: string) => e.toUpperCase())(Err('oops'))).toEqual(Err('OOPS')));
  it('passes Ok through unchanged', () => expect(mapLeft((e: string) => e.toUpperCase())(Ok(1))).toEqual(Ok(1)));
});

describe('swap', () => {
  it('swaps Ok to Err', () => expect(swap(Ok(1))).toEqual(Err(1)));
  it('swaps Err to Ok', () => expect(swap(Err('e'))).toEqual(Ok('e')));
});

describe('toOption', () => {
  it('converts Ok to Some', () => expect(toOption(Ok(42))).toEqual(Some(42)));
  it('converts Err to None', () => expect(toOption(Err('e'))).toEqual(None));
});

describe('ap', () => {
  const double = (n: number) => n * 2;

  it('applies wrapped function to wrapped value', () => {
    expect(ap(Ok(double))(Ok(5))).toEqual(Ok(10));
  });

  it('returns Err when the function is Err', () => {
    expect(ap(Err<typeof double, string>('no fn'))(Ok(5))).toEqual(Err('no fn'));
  });

  it('returns Err when the argument is Err', () => {
    expect(ap(Ok(double))(Err<number, string>('bad val'))).toEqual(Err('bad val'));
  });

  it('returns the function Err when both are Err (first wins)', () => {
    expect(ap(Err<typeof double, string>('fn-err'))(Err<number, string>('val-err'))).toEqual(Err('fn-err'));
  });

  it('composes with mapResult for curried functions', () => {
    const add = (a: number) => (b: number) => a + b;
    const addToThree = mapResult(add)(Ok(3));
    expect(ap(addToThree)(Ok(4))).toEqual(Ok(7));
  });
});

describe('liftA2', () => {
  const add = (a: number, b: number) => a + b;

  it('applies fn when both Results are Ok', () => {
    expect(liftA2(add)(Ok(3), Ok(4))).toEqual(Ok(7));
  });

  it('returns the first Err when ra is Err', () => {
    expect(liftA2(add)(Err<number, string>('x'), Ok(4))).toEqual(Err('x'));
  });

  it('returns the second Err when only rb is Err', () => {
    expect(liftA2(add)(Ok(3), Err<number, string>('y'))).toEqual(Err('y'));
  });

  it('returns the first Err when both are Err', () => {
    expect(liftA2(add)(Err<number, string>('first'), Err<number, string>('second'))).toEqual(Err('first'));
  });

  it('works with a real-world combine use case', () => {
    type User = { name: string; age: number };
    const makeUser = (name: string, age: number): User => ({ name, age });
    const parseName = (s: string): Result<string, string> =>
      s.length > 0 ? Ok(s) : Err('name required');
    const parseAge = (n: number): Result<number, string> =>
      n >= 0 ? Ok(n) : Err('age must be non-negative');

    expect(liftA2(makeUser)(parseName('Alice'), parseAge(30))).toEqual(Ok({ name: 'Alice', age: 30 }));
    expect(liftA2(makeUser)(parseName(''), parseAge(30))).toEqual(Err('name required'));
  });
});

describe('liftA3', () => {
  const sum3 = (a: number, b: number, c: number) => a + b + c;

  it('applies fn when all three Results are Ok', () => {
    expect(liftA3(sum3)(Ok(1), Ok(2), Ok(3))).toEqual(Ok(6));
  });

  it('returns the first Err (ra)', () => {
    expect(liftA3(sum3)(Err<number, string>('a'), Ok(2), Ok(3))).toEqual(Err('a'));
  });

  it('returns the second Err (rb) when ra is Ok', () => {
    expect(liftA3(sum3)(Ok(1), Err<number, string>('b'), Ok(3))).toEqual(Err('b'));
  });

  it('returns the third Err (rc) when ra and rb are Ok', () => {
    expect(liftA3(sum3)(Ok(1), Ok(2), Err<number, string>('c'))).toEqual(Err('c'));
  });

  it('returns the first Err when all three fail', () => {
    expect(liftA3(sum3)(
      Err<number, string>('first'),
      Err<number, string>('second'),
      Err<number, string>('third'),
    )).toEqual(Err('first'));
  });
});
