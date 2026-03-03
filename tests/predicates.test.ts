import { describe, it, expect } from 'vitest';
import {
  isNotEmpty, isNotNull, hasProperty,
  not, and, or, xor, nand, nor,
  gt, gte, lt, lte, eq, neq, between,
  isString, isNumber, isBoolean, isFunction, isArray,
  isNull, isUndefined, isNil, isDate, isRegExp, isPromise,
  isEven, isOdd, isPositive, isNegative, isZero,
  isInteger, isNotANumber, isFiniteNumber, isInfinite,
} from '../src/predicates.js';

describe('isNotEmpty', () => {
  it('returns true for non-empty strings', () => expect(isNotEmpty('hello')).toBe(true));
  it('returns false for empty string', () => expect(isNotEmpty('')).toBe(false));
  it('returns false for whitespace-only string', () => expect(isNotEmpty('   ')).toBe(false));
});

describe('isNotNull', () => {
  it('returns true for non-null values', () => {
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull('')).toBe(true);
    expect(isNotNull(false)).toBe(true);
  });

  it('returns false for null', () => expect(isNotNull(null)).toBe(false));
  it('returns false for undefined', () => expect(isNotNull(undefined)).toBe(false));
});

describe('hasProperty', () => {
  it('returns true when key exists with a value', () => {
    type WithName = { name: string };
    expect(hasProperty<WithName, 'name'>('name')({ name: 'Alice' })).toBe(true);
  });

  it('returns false when value is null', () => {
    type WithNullableName = { name: string | null };
    expect(hasProperty<WithNullableName, 'name'>('name')({ name: null })).toBe(false);
  });
});

describe('logical combinators', () => {
  const isEvenNum = (x: number) => x % 2 === 0;
  const isPositiveNum = (x: number) => x > 0;

  it('not inverts a predicate', () => {
    expect(not(isEvenNum)(3)).toBe(true);
    expect(not(isEvenNum)(4)).toBe(false);
  });

  it('and requires all predicates to pass', () => {
    const isPositiveEven = and(isPositiveNum, isEvenNum);
    expect(isPositiveEven(4)).toBe(true);
    expect(isPositiveEven(3)).toBe(false);
    expect(isPositiveEven(-2)).toBe(false);
  });

  it('or requires at least one predicate to pass', () => {
    const isZeroOrNeg = or((x: number) => x === 0, (x: number) => x < 0);
    expect(isZeroOrNeg(0)).toBe(true);
    expect(isZeroOrNeg(-5)).toBe(true);
    expect(isZeroOrNeg(5)).toBe(false);
  });

  it('xor passes only when exactly one predicate is true', () => {
    const xorPred = xor(isEvenNum, isPositiveNum);
    expect(xorPred(2)).toBe(false);   // both true
    expect(xorPred(3)).toBe(true);    // only positive
    expect(xorPred(-2)).toBe(true);   // only even
    expect(xorPred(-3)).toBe(false);  // neither
  });

  it('nand is negation of and', () => {
    expect(nand(isEvenNum, isPositiveNum)(4)).toBe(false);  // both true → nand false
    expect(nand(isEvenNum, isPositiveNum)(3)).toBe(true);   // not both
  });

  it('nor is negation of or', () => {
    expect(nor(isEvenNum, isPositiveNum)(-3)).toBe(true);   // neither
    expect(nor(isEvenNum, isPositiveNum)(4)).toBe(false);   // both true
  });
});

describe('comparison predicates', () => {
  it('gt', () => {
    expect(gt(10)(15)).toBe(true);
    expect(gt(10)(5)).toBe(false);
    expect(gt(10)(10)).toBe(false);
  });

  it('gte', () => {
    expect(gte(10)(10)).toBe(true);
    expect(gte(10)(11)).toBe(true);
    expect(gte(10)(9)).toBe(false);
  });

  it('lt', () => {
    expect(lt(10)(5)).toBe(true);
    expect(lt(10)(10)).toBe(false);
  });

  it('lte', () => {
    expect(lte(10)(10)).toBe(true);
    expect(lte(10)(9)).toBe(true);
    expect(lte(10)(11)).toBe(false);
  });

  it('eq', () => {
    expect(eq(42)(42)).toBe(true);
    expect(eq(42)(43)).toBe(false);
  });

  it('neq', () => {
    expect(neq(0)(1)).toBe(true);
    expect(neq(0)(0)).toBe(false);
  });

  it('between (inclusive)', () => {
    expect(between(1, 10)(5)).toBe(true);
    expect(between(1, 10)(1)).toBe(true);
    expect(between(1, 10)(10)).toBe(true);
    expect(between(1, 10)(0)).toBe(false);
    expect(between(1, 10)(11)).toBe(false);
  });
});

describe('type predicates', () => {
  it('isString', () => {
    expect(isString('hello')).toBe(true);
    expect(isString(42)).toBe(false);
  });

  it('isNumber', () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber('42')).toBe(false);
  });

  it('isBoolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(1)).toBe(false);
  });

  it('isFunction', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(42)).toBe(false);
  });

  it('isArray', () => {
    expect(isArray([1, 2])).toBe(true);
    expect(isArray({ 0: 1 })).toBe(false);
  });

  it('isNull', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
  });

  it('isUndefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
  });

  it('isNil', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
  });

  it('isDate', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('invalid'))).toBe(false);
    expect(isDate('2024-01-01')).toBe(false);
  });

  it('isRegExp', () => {
    expect(isRegExp(/test/)).toBe(true);
    expect(isRegExp('test')).toBe(false);
  });

  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({ then: () => {} })).toBe(true);
    expect(isPromise({})).toBe(false);
  });
});

describe('numeric predicates', () => {
  it('isEven', () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(3)).toBe(false);
  });

  it('isOdd', () => {
    expect(isOdd(3)).toBe(true);
    expect(isOdd(4)).toBe(false);
  });

  it('isPositive', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
  });

  it('isNegative', () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(0)).toBe(false);
  });

  it('isZero', () => {
    expect(isZero(0)).toBe(true);
    expect(isZero(0.0)).toBe(true);
    expect(isZero(1)).toBe(false);
  });

  it('isInteger', () => {
    expect(isInteger(42)).toBe(true);
    expect(isInteger(42.5)).toBe(false);
  });

  it('isNotANumber', () => {
    expect(isNotANumber(NaN)).toBe(true);
    expect(isNotANumber(0)).toBe(false);
  });

  it('isFiniteNumber', () => {
    expect(isFiniteNumber(42)).toBe(true);
    expect(isFiniteNumber(Infinity)).toBe(false);
  });

  it('isInfinite', () => {
    expect(isInfinite(Infinity)).toBe(true);
    expect(isInfinite(-Infinity)).toBe(true);
    expect(isInfinite(42)).toBe(false);
  });
});
