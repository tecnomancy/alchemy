import { describe, it, expect } from 'vitest';
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
  validateAll, validateAny,
} from '../src/result.js';

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
    const r = mapResult((n: number) => n * 2)(Err('e'));
    expect(isErr(r)).toBe(true);
  });

  it('mapErr transforms Err value', () => {
    const r = mapErr((e: string) => e.toUpperCase())(Err('oops'));
    if (!r.ok) expect(r.error).toBe('OOPS');
  });

  it('flatMap chains Ok results', () => {
    const divide = (n: number) => n === 0 ? Err('zero') : Ok(100 / n);
    expect(unwrap(flatMap(divide)(Ok(5)))).toBe(20);
  });

  it('flatMap short-circuits on Err', () => {
    const r = flatMap((n: number) => Ok(n * 2))(Err('e'));
    expect(isErr(r)).toBe(true);
  });

  it('andThen is an alias for flatMap', () => {
    expect(unwrap(andThen((n: number) => Ok(n + 1))(Ok(9)))).toBe(10);
  });
});

describe('Result — match', () => {
  it('calls onOk branch', () => {
    const msg = match((v: number) => `ok:${v}`, (e: string) => `err:${e}`)(Ok(42));
    expect(msg).toBe('ok:42');
  });

  it('calls onErr branch', () => {
    const msg = match((v: number) => `ok:${v}`, (e: string) => `err:${e}`)(Err('boom'));
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
    expect(unwrapOr(0)(Err('x'))).toBe(0);
    expect(unwrapOr(0)(Ok(99))).toBe(99);
  });

  it('unwrapOrElse computes fallback', () => {
    expect(unwrapOrElse((e: string) => e.length)(Err('abc'))).toBe(3);
  });
});

describe('Result — combinators', () => {
  it('combineAll returns Ok of all values', () => {
    expect(unwrap(combineAll([Ok(1), Ok(2), Ok(3)]))).toEqual([1, 2, 3]);
  });

  it('combineAll fails on first Err', () => {
    const r = combineAll([Ok(1), Err('e1'), Ok(3)]);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('e1');
  });

  it('combineTwo merges two Ok values', () => {
    const r = combineTwo((a: number, b: number) => a + b)(Ok(3), Ok(4));
    expect(unwrap(r)).toBe(7);
  });

  it('collectErrors collects all errors', () => {
    const r = collectErrors([Ok(1), Err('e1'), Ok(2), Err('e2')]);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toEqual(['e1', 'e2']);
  });

  it('collectErrors returns Ok if no errors', () => {
    const r = collectErrors([Ok(1), Ok(2)]);
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
  const isPositive = (n: number) => n > 0 ? Ok(n) : Err('not positive');
  const isEven = (n: number) => n % 2 === 0 ? Ok(n) : Err('not even');

  it('validateAll passes all validators', () => {
    expect(isOk(validateAll([isPositive, isEven])(4))).toBe(true);
  });

  it('validateAll fails on first invalid', () => {
    const r = validateAll([isPositive, isEven])(3);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error).toBe('not even');
  });

  it('validateAny passes if at least one validator succeeds', () => {
    expect(isOk(validateAny([isPositive, isEven])(3))).toBe(true); // positive
  });

  it('validateAny fails if all validators fail', () => {
    expect(isErr(validateAny([isPositive, isEven])(-3))).toBe(true);
  });
});
