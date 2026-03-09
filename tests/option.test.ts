import { describe, it, expect } from 'vitest';
import {
  Some, None,
  fromNullable, fromTryCatch,
  isSome, isNone,
  mapOption, flatMapOption, andThenOption,
  matchOption,
  unwrapOption, unwrapOptionOr, unwrapOptionOrElse,
  orElseOption,
  toNullable, toArray,
  zipOption, sequenceOption, compactOptions,
  filterOption, getOrElse, getOr,
} from '../src/option.js';
import { Ok, Err, isOk, isErr } from '../src/result.js';
import { optionToResult, resultToOption } from '../src/interop.js';

describe('Option — constructors', () => {
  it('Some wraps a value', () => {
    const opt = Some(42);
    expect(isSome(opt)).toBe(true);
    if (opt._tag === 'Some') expect(opt.value).toBe(42);
  });

  it('None represents absence', () => {
    expect(isNone(None)).toBe(true);
  });

  it('fromNullable wraps non-null values', () => {
    expect(isSome(fromNullable(0))).toBe(true);
    expect(isSome(fromNullable(''))).toBe(true);
    expect(isSome(fromNullable(false))).toBe(true);
  });

  it('fromNullable returns None for null/undefined', () => {
    expect(isNone(fromNullable(null))).toBe(true);
    expect(isNone(fromNullable(undefined))).toBe(true);
  });

  it('fromTryCatch returns Some on success', () => {
    expect(isSome(fromTryCatch(() => JSON.parse('{"a":1}')))).toBe(true);
  });

  it('fromTryCatch returns None on throw', () => {
    expect(isNone(fromTryCatch(() => JSON.parse('bad')))).toBe(true);
  });
});

describe('Option — type guards', () => {
  it('isSome / isNone narrow correctly', () => {
    expect(isSome(Some(1))).toBe(true);
    expect(isSome(None)).toBe(false);
    expect(isNone(None)).toBe(true);
    expect(isNone(Some(1))).toBe(false);
  });
});

describe('Option — transformations', () => {
  it('mapOption transforms Some', () => {
    const r = mapOption((n: number) => n * 2)(Some(5));
    expect(isSome(r) && r.value).toBe(10);
  });

  it('mapOption passes None through', () => {
    expect(isNone(mapOption((n: number) => n * 2)(None))).toBe(true);
  });

  it('flatMapOption chains Some values', () => {
    const safeSqrt = (n: number) => n >= 0 ? Some(Math.sqrt(n)) : None;
    expect(unwrapOption(flatMapOption(safeSqrt)(Some(16)))).toBe(4);
    expect(isNone(flatMapOption(safeSqrt)(Some(-1)))).toBe(true);
  });

  it('flatMapOption short-circuits None', () => {
    expect(isNone(flatMapOption((n: number) => Some(n))(None))).toBe(true);
  });

  it('andThenOption is an alias for flatMapOption', () => {
    const r = andThenOption((n: number) => Some(n + 1))(Some(9));
    expect(unwrapOption(r)).toBe(10);
  });
});

describe('Option — matchOption', () => {
  it('calls onSome branch', () => {
    const r = matchOption((v: number) => `got:${v}`, () => 'none')(Some(7));
    expect(r).toBe('got:7');
  });

  it('calls onNone branch', () => {
    const r = matchOption((v: number) => `got:${v}`, () => 'none')(None);
    expect(r).toBe('none');
  });
});

describe('Option — unwrap variants', () => {
  it('unwrapOption extracts Some value', () => {
    expect(unwrapOption(Some(42))).toBe(42);
  });

  it('unwrapOption throws on None', () => {
    expect(() => unwrapOption(None)).toThrow();
  });

  it('unwrapOptionOr returns default on None', () => {
    expect(unwrapOptionOr(0)(None)).toBe(0);
    expect(unwrapOptionOr(0)(Some(99))).toBe(99);
  });

  it('unwrapOptionOrElse computes fallback', () => {
    expect(unwrapOptionOrElse(() => 42)(None)).toBe(42);
  });

  it('orElseOption returns fallback Option on None', () => {
    const r = orElseOption(() => Some(99))(None);
    expect(unwrapOption(r)).toBe(99);
  });

  it('orElseOption returns original Some', () => {
    const r = orElseOption(() => Some(99))(Some(1));
    expect(unwrapOption(r)).toBe(1);
  });
});

describe('Option — conversions', () => {
  it('toNullable extracts value or null', () => {
    expect(toNullable(Some(5))).toBe(5);
    expect(toNullable(None)).toBeNull();
  });

  it('toArray wraps Some in array, None to empty', () => {
    expect(toArray(Some(1))).toEqual([1]);
    expect(toArray(None)).toEqual([]);
  });
});

describe('Option — combinators', () => {
  it('zipOption combines two Somes', () => {
    const r = zipOption(Some(1), Some('a'));
    expect(unwrapOption(r)).toEqual([1, 'a']);
  });

  it('zipOption returns None if either is None', () => {
    expect(isNone(zipOption(None, Some('a')))).toBe(true);
    expect(isNone(zipOption(Some(1), None))).toBe(true);
  });

  it('sequenceOption returns Some of array', () => {
    const r = sequenceOption([Some(1), Some(2), Some(3)]);
    expect(unwrapOption(r)).toEqual([1, 2, 3]);
  });

  it('sequenceOption returns None if any is None', () => {
    expect(isNone(sequenceOption([Some(1), None, Some(3)]))).toBe(true);
  });

  it('compactOptions filters out None values', () => {
    expect(compactOptions([Some(1), None, Some(2), None, Some(3)])).toEqual([1, 2, 3]);
  });
});

describe('Option — interop with Result', () => {
  it('optionToResult converts Some to Ok', () => {
    const r = optionToResult(() => 'not found')(Some(42));
    expect(isOk(r) && r.value).toBe(42);
  });

  it('optionToResult converts None to Err', () => {
    const r = optionToResult(() => 'not found')(None);
    expect(isErr(r) && r.error).toBe('not found');
  });

  it('resultToOption converts Ok to Some', () => {
    expect(isSome(resultToOption(Ok(42)))).toBe(true);
  });

  it('resultToOption converts Err to None', () => {
    expect(isNone(resultToOption(Err('oops')))).toBe(true);
  });
});

describe('filterOption', () => {
  it('keeps Some when predicate holds', () => {
    expect(filterOption((n: number) => n > 0)(Some(42))).toEqual(Some(42));
  });
  it('converts Some to None when predicate fails', () => {
    expect(isNone(filterOption((n: number) => n > 0)(Some(-1)))).toBe(true);
  });
  it('passes None through', () => {
    expect(isNone(filterOption((n: number) => n > 0)(None))).toBe(true);
  });
});

describe('getOrElse', () => {
  it('extracts Some value', () => {
    expect(getOrElse(() => 0)(Some(42))).toBe(42);
  });
  it('calls fallback on None', () => {
    expect(getOrElse(() => 99)(None)).toBe(99);
  });
});

describe('getOr', () => {
  it('extracts Some value', () => {
    expect(getOr(0)(Some(42))).toBe(42);
  });
  it('returns default on None', () => {
    expect(getOr(99)(None)).toBe(99);
  });
});
