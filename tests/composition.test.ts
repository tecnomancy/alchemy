import { describe, it, expect, vi } from 'vitest';
import {
  pipe, compose, flow, curry,
  identity, constant, tap, prop,
  memoize, flip, once, negate, partial, after, before,
} from '../src/composition.js';

describe('pipe — heterogeneous type inference', () => {
  it('single value passes through', () => {
    expect(pipe(42)).toBe(42);
  });

  it('two steps with different types', () => {
    const r = pipe('hello', s => s.length);
    // TypeScript knows r is number
    expect(r).toBe(5);
  });

  it('three steps: string → string[] → number', () => {
    const r = pipe('hello world', s => s.split(' '), arr => arr.length);
    expect(r).toBe(2);
  });

  it('four steps', () => {
    const r = pipe(
      '1,2,3,4,5',
      s => s.split(','),
      arr => arr.map(Number),
      nums => nums.reduce((a, b) => a + b, 0),
      n => `total: ${n}`,
    );
    expect(r).toBe('total: 15');
  });

  it('five steps — mix of transformations', () => {
    // [1,2,3,4,5] → [2,4] → [20,40] → 60 → true → 'yes'
    const r = pipe(
      [1, 2, 3, 4, 5],
      arr => arr.filter((n: number) => n % 2 === 0),
      arr => arr.map((n: number) => n * 10),
      arr => arr.reduce((a: number, b: number) => a + b, 0),
      n => n > 50,
      b => b ? 'yes' : 'no',
    );
    expect(r).toBe('yes');
  });
});

describe('compose — right-to-left', () => {
  it('single function returns a function', () => {
    const double = compose((n: number) => n * 2);
    expect(double(5)).toBe(10);
  });

  it('two functions applied right-to-left', () => {
    const fn = compose(
      (n: number) => `result:${n}`,
      (s: string) => s.length,
    );
    expect(fn('hello')).toBe('result:5');
  });

  it('three steps', () => {
    const fn = compose(
      (n: number) => n > 1,
      (arr: string[]) => arr.length,
      (s: string) => s.split(' '),
    );
    expect(fn('hello world')).toBe(true);
  });
});

describe('curry', () => {
  it('curries a binary function', () => {
    const add = curry((a: number, b: number) => a + b);
    expect(add(1)(2)).toBe(3);
  });

  it('supports partial application', () => {
    const multiply = curry((a: number, b: number) => a * b);
    const double = multiply(2);
    expect(double(5)).toBe(10);
    expect(double(10)).toBe(20);
  });

  it('curries a ternary function', () => {
    const add3 = curry((a: number, b: number, c: number) => a + b + c);
    expect(add3(1)(2)(3)).toBe(6);
  });
});

describe('identity', () => {
  it('returns its argument unchanged', () => {
    expect(identity(42)).toBe(42);
    expect(identity('hello')).toBe('hello');
    const obj = { a: 1 };
    expect(identity(obj)).toBe(obj);
  });
});

describe('constant', () => {
  it('always returns the same value', () => {
    const always42 = constant(42);
    expect(always42()).toBe(42);
    expect(always42('ignored')).toBe(42);
  });
});

describe('tap', () => {
  it('runs side effect and returns value unchanged', () => {
    const spy = vi.fn();
    const result = tap<number>(spy)(99);
    expect(result).toBe(99);
    expect(spy).toHaveBeenCalledWith(99);
  });

  it('integrates with pipe', () => {
    const log: number[] = [];
    const r = pipe(5, n => n * 2, tap(n => log.push(n)), n => n + 1);
    expect(r).toBe(11);
    expect(log).toEqual([10]);
  });
});

describe('prop', () => {
  it('extracts object property', () => {
    const getName = prop<{ name: string; age: number }, 'name'>('name');
    expect(getName({ name: 'Alice', age: 30 })).toBe('Alice');
  });
});

describe('memoize', () => {
  it('caches results of pure functions', () => {
    let calls = 0;
    const expensive = memoize((n: number) => { calls++; return n * 2; });
    expensive(5);
    expensive(5);
    expensive(5);
    expect(calls).toBe(1);
    expensive(10);
    expect(calls).toBe(2);
  });
});

describe('flip', () => {
  it('inverts argument order', () => {
    const divide = (a: number, b: number) => a / b;
    const flipped = flip(divide);
    expect(divide(10, 2)).toBe(5);
    expect(flipped(2, 10)).toBe(5);
  });
});

describe('once', () => {
  it('executes function only once', () => {
    let count = 0;
    const init = once(() => ++count);
    init();
    init();
    init();
    expect(count).toBe(1);
  });

  it('returns the same value on subsequent calls', () => {
    const fn = once(() => Math.random());
    const first = fn();
    expect(fn()).toBe(first);
    expect(fn()).toBe(first);
  });
});

describe('negate', () => {
  it('inverts a predicate', () => {
    const isEven = (n: number) => n % 2 === 0;
    const isOdd = negate(isEven);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(4)).toBe(false);
  });
});

describe('partial', () => {
  it('pre-fills leading arguments', () => {
    const add = (a: number, b: number, c: number) => a + b + c;
    const add5 = partial(add, 5);
    expect(add5(3, 2)).toBe(10);
  });
});

describe('after', () => {
  it('runs only after N calls', () => {
    let triggered = false;
    const fn = after(3, () => { triggered = true; });
    fn(); fn();
    expect(triggered).toBe(false);
    fn();
    expect(triggered).toBe(true);
  });
});

describe('before', () => {
  it('runs only for the first N-1 calls', () => {
    let count = 0;
    const fn = before(3, () => ++count);
    fn(); fn(); fn(); fn();
    expect(count).toBe(2);
  });
});

describe('flow', () => {
  it('composes functions left-to-right and returns a function', () => {
    const process = flow(
      (s: string) => s.split(' '),
      (arr: string[]) => arr.length,
      (n: number) => n > 1,
    );
    expect(process('hello world')).toBe(true);
    expect(process('hello')).toBe(false);
  });

  it('passes through a single function', () => {
    const double = flow((n: number) => n * 2);
    expect(double(5)).toBe(10);
  });

  it('composes three functions left-to-right', () => {
    const transform = flow(
      (n: number) => n + 1,
      (n: number) => n * 2,
      (n: number) => -n,
    );
    // (3 + 1) * 2 = 8, -8
    expect(transform(3)).toBe(-8);
  });

  it('infers types correctly across steps', () => {
    const result: boolean = flow(
      (n: number) => String(n),
      (s: string) => s.length > 1,
    )(42);
    expect(result).toBe(true);
  });
});
