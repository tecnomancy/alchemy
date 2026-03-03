/**
 * Point-free composition helpers: compose (right-to-left), flow (left-to-right).
 * @internal
 */

// ============================================================================
// COMPOSE — right-to-left, heterogeneous types
// ============================================================================

/**
 * Composes functions right-to-left into a single function.
 * The rightmost function is applied first.
 *
 * @example
 * const process = compose(
 *   (n: number) => n > 1,    // boolean
 *   (arr: string[]) => arr.length, // number
 *   (s: string) => s.split(' '),   // string[]
 * );
 * process('hello world'); // true
 */
export function compose<A, B>(f1: (a: A) => B): (a: A) => B;
export function compose<A, B, C>(f2: (b: B) => C, f1: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(
  f3: (c: C) => D, f2: (b: B) => C, f1: (a: A) => B): (a: A) => D;
export function compose<A, B, C, D, E>(
  f4: (d: D) => E, f3: (c: C) => D, f2: (b: B) => C, f1: (a: A) => B): (a: A) => E;
export function compose<A, B, C, D, E, F>(
  f5: (e: E) => F, f4: (d: D) => E, f3: (c: C) => D,
  f2: (b: B) => C, f1: (a: A) => B): (a: A) => F;
export function compose<A, B, C, D, E, F, G>(
  f6: (f: F) => G, f5: (e: E) => F, f4: (d: D) => E,
  f3: (c: C) => D, f2: (b: B) => C, f1: (a: A) => B): (a: A) => G;
export function compose(...fns: Array<(x: unknown) => unknown>): (a: unknown) => unknown {
  return (value: unknown) => fns.reduceRight((acc, fn) => fn(acc), value);
}

// ============================================================================
// FLOW — left-to-right point-free composition
// ============================================================================

/**
 * Creates a left-to-right function pipeline (point-free).
 * Unlike `pipe`, `flow` takes only functions and returns a new function.
 * The first function sets the input type; subsequent functions chain the output.
 *
 * @example
 * const process = flow(
 *   (s: string) => s.split(' '),   // string → string[]
 *   (arr: string[]) => arr.length, // string[] → number
 *   (n: number) => n > 1,          // number → boolean
 * );
 * process('hello world'); // true
 */
export function flow<A, B>(f1: (a: A) => B): (a: A) => B;
export function flow<A, B, C>(f1: (a: A) => B, f2: (b: B) => C): (a: A) => C;
export function flow<A, B, C, D>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D): (a: A) => D;
export function flow<A, B, C, D, E>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D, f4: (d: D) => E): (a: A) => E;
export function flow<A, B, C, D, E, F>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F): (a: A) => F;
export function flow<A, B, C, D, E, F, G>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G): (a: A) => G;
export function flow<A, B, C, D, E, F, G, H>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H): (a: A) => H;
export function flow<A, B, C, D, E, F, G, H, I>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G,
  f7: (g: G) => H, f8: (h: H) => I): (a: A) => I;
export function flow<A, B, C, D, E, F, G, H, I, J>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G,
  f7: (g: G) => H, f8: (h: H) => I, f9: (i: I) => J): (a: A) => J;
export function flow<A, B, C, D, E, F, G, H, I, J, K>(
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G,
  f7: (g: G) => H, f8: (h: H) => I, f9: (i: I) => J, f10: (j: J) => K): (a: A) => K;
export function flow(...fns: Array<(x: unknown) => unknown>): (a: unknown) => unknown {
  return (value: unknown) => fns.reduce((acc, fn) => fn(acc), value);
}
