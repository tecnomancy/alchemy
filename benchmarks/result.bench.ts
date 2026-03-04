import { bench, describe } from 'vitest';
import { Ok, Err, flatMap, match, combineAll, type Result } from '../src/result.js';

// Competitors (Ramda, lodash, Remeda) have no Result/Either type.
// The baseline is idiomatic try/catch to show fp-core's overhead vs. raw JS.

// ============================================================================
// flatMap — chained safe computation
// ============================================================================

const safeDivide =
  (n: number) =>
  (x: number): Result<number, Error> =>
    x === 0 ? Err(new Error('division by zero')) : Ok(n / x);

describe('result.flatMap — 3 chained operations', () => {
  bench('fp-core', () => {
    flatMap(safeDivide(6))(
      flatMap(safeDivide(100))(Ok<number, Error>(10))
    );
  });

  bench('native try/catch', () => {
    try {
      const a = 10;
      const b = 100 / a;
      const _c = 6 / b;
    } catch (_) {
      // ignore
    }
  });
});

// ============================================================================
// match — pattern matching on result
// ============================================================================

const okResult: Result<number, Error> = Ok(42);
const errResult: Result<number, Error> = Err(new Error('oops'));

const matchFns: [(v: number) => string, (e: Error) => string] = [
  (v) => `value: ${v}`,
  (e) => `error: ${e.message}`,
];

describe('result.match — ok branch', () => {
  bench('fp-core', () => {
    match(matchFns[0], matchFns[1])(okResult);
  });

  bench('native ternary', () => {
    void (okResult.ok
      ? `value: ${okResult.value}`
      : `error: ${(okResult as { ok: false; error: Error }).error.message}`);
  });
});

describe('result.match — error branch', () => {
  bench('fp-core', () => {
    match(matchFns[0], matchFns[1])(errResult);
  });

  bench('native ternary', () => {
    void (errResult.ok
      ? `value: ${(errResult as { ok: true; value: number }).value}`
      : `error: ${errResult.error.message}`);
  });
});

// ============================================================================
// combineAll — collect results
// ============================================================================

const OK_RESULTS: Result<number, Error>[] = Array.from({ length: 100 }, (_, i) =>
  Ok<number, Error>(i),
);
const MIXED_RESULTS: Result<number, Error>[] = Array.from({ length: 100 }, (_, i) =>
  i === 50 ? Err<number, Error>(new Error('fail')) : Ok<number, Error>(i),
);

describe('result.combineAll — 100 Ok results', () => {
  bench('fp-core', () => {
    combineAll(OK_RESULTS);
  });

  bench('native loop', () => {
    const values: number[] = [];
    for (const r of OK_RESULTS) {
      if (!r.ok) return;
      values.push(r.value);
    }
  });
});

describe('result.combineAll — 100 results, 1 error at index 50', () => {
  bench('fp-core', () => {
    combineAll(MIXED_RESULTS);
  });

  bench('native loop', () => {
    const values: number[] = [];
    for (const r of MIXED_RESULTS) {
      if (!r.ok) return;
      values.push(r.value);
    }
  });
});
