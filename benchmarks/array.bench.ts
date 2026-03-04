import { bench, describe } from 'vitest';
import * as R from 'ramda';
import * as L from 'lodash/fp';
import * as Re from 'remeda';
import { map, filter, groupBy, chunk } from '../src/array.js';

const NUMBERS = Array.from({ length: 1000 }, (_, i) => i);
const double = (x: number) => x * 2;
const isEven = (x: number) => x % 2 === 0;

// ============================================================================
// map
// ============================================================================

describe('array.map — 1 000 numbers', () => {
  bench('fp-core', () => {
    map(double)(NUMBERS);
  });

  bench('ramda', () => {
    R.map(double, NUMBERS);
  });

  bench('lodash/fp', () => {
    L.map(double)(NUMBERS);
  });

  bench('remeda', () => {
    Re.map(NUMBERS, double);
  });

  bench('native', () => {
    NUMBERS.map(double);
  });
});

// ============================================================================
// filter
// ============================================================================

describe('array.filter — 1 000 numbers', () => {
  bench('fp-core', () => {
    filter(isEven)(NUMBERS);
  });

  bench('ramda', () => {
    R.filter(isEven, NUMBERS);
  });

  bench('lodash/fp', () => {
    L.filter(isEven)(NUMBERS);
  });

  bench('remeda', () => {
    Re.filter(NUMBERS, isEven);
  });

  bench('native', () => {
    NUMBERS.filter(isEven);
  });
});

// ============================================================================
// groupBy
// ============================================================================

const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const byLength = (s: string) => String(s.length);

describe('array.groupBy — 10 words', () => {
  bench('fp-core', () => {
    groupBy(byLength)(WORDS);
  });

  bench('ramda', () => {
    R.groupBy(byLength, WORDS);
  });

  bench('lodash/fp', () => {
    L.groupBy(byLength)(WORDS);
  });

  bench('remeda', () => {
    Re.groupBy(WORDS, byLength);
  });
});

// ============================================================================
// chunk
// ============================================================================

describe('array.chunk — 1 000 numbers, size 10', () => {
  bench('fp-core', () => {
    chunk(10)(NUMBERS);
  });

  bench('ramda', () => {
    R.splitEvery(10, NUMBERS);
  });

  bench('lodash/fp', () => {
    L.chunk(10)(NUMBERS);
  });

  bench('remeda', () => {
    Re.chunk(NUMBERS, 10);
  });
});
