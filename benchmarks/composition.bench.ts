import { bench, describe } from 'vitest';
import * as R from 'ramda';
import * as Re from 'remeda';
import { pipe, compose } from '../src/composition.js';

// Five arithmetic steps used in every pipeline benchmark
const add1 = (x: number) => x + 1;
const double = (x: number) => x * 2;
const sub3 = (x: number) => x - 3;
const square = (x: number) => x * x;
const negate = (x: number) => -x;

// ============================================================================
// pipe — 5-step, left-to-right
// ============================================================================

describe('composition.pipe — 5 steps, number', () => {
  bench('fp-core', () => {
    pipe(10, add1, double, sub3, square, negate);
  });

  bench('ramda', () => {
    R.pipe(add1, double, sub3, square, negate)(10);
  });

  bench('remeda', () => {
    Re.pipe(10, add1, double, sub3, square, negate);
  });

  bench('native', () => {
    negate(square(sub3(double(add1(10)))));
  });
});

// ============================================================================
// compose — 5-step, right-to-left
// ============================================================================

describe('composition.compose — 5 steps, number', () => {
  bench('fp-core', () => {
    compose(negate, square, sub3, double, add1)(10);
  });

  bench('ramda', () => {
    R.compose(negate, square, sub3, double, add1)(10);
  });

  bench('native', () => {
    negate(square(sub3(double(add1(10)))));
  });
});
