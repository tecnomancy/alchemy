/**
 * Async composition helpers: pipeAsync, composeAsync.
 * @internal
 */

// ============================================================================
// ASYNC COMPOSITION
// ============================================================================

/**
 * Async version of `pipe` — composes async functions left to right.
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: 'Alice' });
 * const getEmail = async (user: { email: string }) => user.email;
 * const sendEmail = async (email: string) => console.log(`Sent to ${email}`);
 *
 * await pipeAsync(fetchUser, getEmail, sendEmail)('user-123');
 */
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
export function pipeAsync(
  ...fns: Array<(arg: unknown) => Promise<unknown>>
): (value: unknown) => Promise<unknown> {
  return async (value: unknown): Promise<unknown> => {
    let result: unknown = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

/**
 * Async version of `compose` — composes async functions right to left.
 *
 * @example
 * const process = composeAsync(formatUser, enrichUser, fetchUser);
 * await process('user-123');
 */
export const composeAsync = (...fns: Array<(arg: unknown) => Promise<unknown>>) =>
  pipeAsync(...([...fns].reverse() as [(typeof fns)[0]]));
