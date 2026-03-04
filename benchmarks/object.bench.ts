import { bench, describe } from 'vitest';
import * as R from 'ramda';
import * as L from 'lodash/fp';
import * as Re from 'remeda';
import { pick, omit, merge, getPath } from '../src/object.js';

// ============================================================================
// pick
// ============================================================================

interface FiveKey { a: number; b: number; c: number; d: number; e: number }
const OBJ: FiveKey = { a: 1, b: 2, c: 3, d: 4, e: 5 };

describe('object.pick — 5-key object, pick 2', () => {
  bench('fp-core', () => {
    pick<FiveKey, 'a' | 'b'>(['a', 'b'])(OBJ);
  });

  bench('ramda', () => {
    R.pick(['a', 'b'], OBJ);
  });

  bench('lodash/fp', () => {
    L.pick(['a', 'b'])(OBJ);
  });

  bench('remeda', () => {
    Re.pick(OBJ, ['a', 'b']);
  });
});

// ============================================================================
// omit
// ============================================================================

describe('object.omit — 5-key object, omit 2', () => {
  bench('fp-core', () => {
    omit<FiveKey, 'd' | 'e'>(['d', 'e'])(OBJ);
  });

  bench('ramda', () => {
    R.omit(['d', 'e'], OBJ);
  });

  bench('lodash/fp', () => {
    L.omit(['d', 'e'])(OBJ);
  });

  bench('remeda', () => {
    Re.omit(OBJ, ['d', 'e']);
  });
});

// ============================================================================
// merge
// ============================================================================

const BASE = { a: 1, b: 2 };
const PATCH = { b: 99, c: 3 };

describe('object.merge — shallow merge', () => {
  bench('fp-core', () => {
    merge(BASE)(PATCH);
  });

  bench('ramda', () => {
    R.mergeRight(BASE, PATCH);
  });

  bench('lodash/fp', () => {
    L.merge(BASE)(PATCH);
  });

  bench('remeda', () => {
    Re.merge(BASE, PATCH);
  });

  bench('native', () => {
    ({ ...BASE, ...PATCH });
  });
});

// ============================================================================
// getPath
// ============================================================================

interface Nested { user: { profile: { name: string; age: number } } }
const NESTED: Nested = { user: { profile: { name: 'Alice', age: 30 } } };

describe('object.getPath — 3-level deep access', () => {
  bench('fp-core', () => {
    getPath<Nested>(['user', 'profile', 'name'])(NESTED);
  });

  bench('ramda', () => {
    R.path(['user', 'profile', 'name'], NESTED);
  });

  bench('lodash/fp', () => {
    L.get('user.profile.name')(NESTED);
  });

  bench('remeda', () => {
    Re.pathOr(NESTED, ['user', 'profile', 'name'], '');
  });
});
