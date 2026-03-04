import { bench, describe } from 'vitest';
import * as L from 'lodash/fp';
import { camelCase, truncate, format, template } from '../src/string.js';

// lodash/fp has camelCase and truncate; no direct format equivalent.
// Remeda has no string utilities — excluded from this module.

// ============================================================================
// camelCase
// ============================================================================

const SNAKE = 'hello_world_foo_bar';

describe('string.camelCase', () => {
  bench('fp-core', () => {
    camelCase(SNAKE);
  });

  bench('lodash/fp', () => {
    L.camelCase(SNAKE);
  });
});

// ============================================================================
// truncate
// ============================================================================

const LONG = 'The quick brown fox jumps over the lazy dog near the riverbank';

describe('string.truncate — 30 chars', () => {
  bench('fp-core', () => {
    truncate(30)(LONG);
  });

  bench('lodash/fp', () => {
    L.truncate({ length: 30 })(LONG);
  });
});

// ============================================================================
// format — printf-style %s/%d
// ============================================================================

const FMT = 'Hello %s, you are %d years old';

describe('string.format — 2 printf placeholders', () => {
  bench('fp-core', () => {
    format(FMT)('Alice', 30);
  });

  bench('native replace', () => {
    let i = 0;
    const args = ['Alice', 30];
    FMT.replace(/%[sd]/g, () => String(args[i++]));
  });
});

// ============================================================================
// template — {{key}} interpolation
// ============================================================================

const TMPL = 'Hello {{name}}, you have {{count}} messages.';
const VALS = { name: 'Alice', count: 5 };

describe('string.template — 2 key interpolations', () => {
  bench('fp-core', () => {
    template(VALS)(TMPL);
  });

  bench('native replace', () => {
    TMPL.replace(/\{\{(\w+)\}\}/g, (_, k) => String((VALS as Record<string, unknown>)[k] ?? ''));
  });
});
