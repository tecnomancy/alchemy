/**
 * fp-core — Functional Programming Primitives for TypeScript
 *
 * Zero-dependency. Tree-shakeable. TypeScript-native.
 * Every function is pure, curried, and data-last.
 *
 * @module fp-core
 */

// Result<T, E> — explicit error handling, no exceptions
export * from './result.js';

// Option<T> — explicit nullability, no null checks
export * from './option.js';

// pipe / compose / curry — type-safe composition (10+ steps inferred)
export * from './composition.js';

// Async utilities — pipeAsync, retry, mapConcurrent, debounce…
export * from './async.js';

// Array — map, filter, reduce, groupBy, partition, chunk…
export * from './array.js';

// Object — pick, omit, merge, mapValues, deepMerge, setPath…
export * from './object.js';

// String — camelCase, kebabCase, truncate, template…
export * from './string.js';

// Predicates — isNull, isString, and, or, not, between…
export * from './predicates.js';
