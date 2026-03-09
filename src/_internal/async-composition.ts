/**
 * Async composition helpers: pipeAsync, composeAsync.
 * @internal
 */

// ============================================================================
// ASYNC COMPOSITION
// ============================================================================

/**
 * Async left-to-right composition with **two calling conventions**:
 *
 * **Value-first** (like sync `pipe`) — pass an initial value, get a `Promise` back immediately:
 * ```ts
 * const result = await pipeAsync(5, async n => n * 2, async n => n + 1); // Promise<11>
 * ```
 *
 * **Point-free** (like `flow`) — pass only functions, get a reusable async pipeline back:
 * ```ts
 * const double = async (n: number) => n * 2;
 * const inc    = async (n: number) => n + 1;
 * const process = pipeAsync(double, inc);   // (n: number) => Promise<number>
 * await process(5); // 11
 * ```
 *
 * TypeScript distinguishes the two forms: if the first argument is a **non-function value**,
 * `pipeAsync` executes immediately; if it is a function, it returns a composed function.
 * Use the `flowAsync` alias when you want to make the point-free intent explicit.
 */
// ── Value-first overloads ──────────────────────────────────────────────────
export function pipeAsync<A>(value: A): Promise<A>;
export function pipeAsync<A, B>(
  value: A, fn1: (a: A) => Promise<B>
): Promise<B>;
export function pipeAsync<A, B, C>(
  value: A, fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>
): Promise<C>;
export function pipeAsync<A, B, C, D>(
  value: A, fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>, fn3: (c: C) => Promise<D>
): Promise<D>;
export function pipeAsync<A, B, C, D, E>(
  value: A, fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>, fn4: (d: D) => Promise<E>
): Promise<E>;
export function pipeAsync<A, B, C, D, E, F>(
  value: A, fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>, fn4: (d: D) => Promise<E>, fn5: (e: E) => Promise<F>
): Promise<F>;
export function pipeAsync<A, B, C, D, E, F, G>(
  value: A, fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>, fn4: (d: D) => Promise<E>, fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>
): Promise<G>;
// ── Point-free overloads ───────────────────────────────────────────────────
export function pipeAsync<A, B>(fn1: (a: A) => Promise<B>): (a: A) => Promise<B>;
export function pipeAsync<A, B, C>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>
): (a: A) => Promise<C>;
export function pipeAsync<A, B, C, D>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>
): (a: A) => Promise<D>;
export function pipeAsync<A, B, C, D, E>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>
): (a: A) => Promise<E>;
export function pipeAsync<A, B, C, D, E, F>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>
): (a: A) => Promise<F>;
export function pipeAsync<A, B, C, D, E, F, G>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>
): (a: A) => Promise<G>;
export function pipeAsync<A, B, C, D, E, F, G, H>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>,
  fn7: (g: G) => Promise<H>
): (a: A) => Promise<H>;
export function pipeAsync<A, B, C, D, E, F, G, H, I>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>,
  fn7: (g: G) => Promise<H>,
  fn8: (h: H) => Promise<I>
): (a: A) => Promise<I>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>,
  fn7: (g: G) => Promise<H>,
  fn8: (h: H) => Promise<I>,
  fn9: (i: I) => Promise<J>
): (a: A) => Promise<J>;
export function pipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
  fn1: (a: A) => Promise<B>,
  fn2: (b: B) => Promise<C>,
  fn3: (c: C) => Promise<D>,
  fn4: (d: D) => Promise<E>,
  fn5: (e: E) => Promise<F>,
  fn6: (f: F) => Promise<G>,
  fn7: (g: G) => Promise<H>,
  fn8: (h: H) => Promise<I>,
  fn9: (i: I) => Promise<J>,
  fn10: (j: J) => Promise<K>
): (a: A) => Promise<K>;
// ── Implementation ─────────────────────────────────────────────────────────
export function pipeAsync(...args: unknown[]): unknown {
  const runPipeline = async (
    initial: unknown,
    fns: Array<(arg: unknown) => Promise<unknown>>
  ): Promise<unknown> => {
    let result = initial;
    for (const fn of fns) result = await fn(result);
    return result;
  };

  if (typeof args[0] !== 'function') {
    // Value-first: execute immediately, return Promise
    const [value, ...fns] = args as [unknown, ...Array<(arg: unknown) => Promise<unknown>>];
    return runPipeline(value, fns);
  }

  // Point-free: return composed function
  const fns = args as Array<(arg: unknown) => Promise<unknown>>;
  return (value: unknown) => runPipeline(value, fns);
}

/**
 * Self-documenting alias for {@link pipeAsync}.
 * Use when you want to make it clear you are building a point-free async pipeline,
 * mirroring the sync `flow` / `pipe` naming convention.
 *
 * @example
 * const process = flowAsync(fetchUser, enrichUser, formatUser);
 * await process('user-123');
 */
export const flowAsync = pipeAsync;

/**
 * Async version of `compose` — composes async functions right to left.
 *
 * @example
 * const process = composeAsync(formatUser, enrichUser, fetchUser);
 * await process('user-123');
 */
export const composeAsync = (...fns: Array<(arg: unknown) => Promise<unknown>>) =>
  pipeAsync(...([...fns].reverse() as [(typeof fns)[0]]));
