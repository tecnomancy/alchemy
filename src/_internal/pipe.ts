/**
 * Value-first left-to-right composition: pipe.
 * @internal
 */

// ============================================================================
// PIPE — left-to-right, heterogeneous types, fully inferred
// ============================================================================

/**
 * Pipes a value through a series of functions left-to-right.
 * Each function's return type becomes the next function's argument type.
 * TypeScript infers every intermediate type — no `any` leakage.
 *
 * Unlike Ramda's `pipe`, this is value-first (not point-free) which makes
 * TypeScript inference work perfectly out of the box.
 *
 * @example
 * pipe(
 *   'hello world',
 *   s => s.split(' '),      // string → string[]
 *   arr => arr.length,      // string[] → number
 *   n => n > 1,             // number → boolean
 * ); // true
 */
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, f1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, f1: (a: A) => B, f2: (b: B) => C): C;
export function pipe<A, B, C, D>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D, f4: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F): F;
export function pipe<A, B, C, D, E, F, G>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G): G;
export function pipe<A, B, C, D, E, F, G, H>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H,
  f8: (h: H) => I): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H,
  f8: (h: H) => I, f9: (i: I) => J): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H,
  f8: (h: H) => I, f9: (i: I) => J, f10: (j: J) => K): K;
export function pipe(value: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}
