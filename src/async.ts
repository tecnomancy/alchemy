/**
 * Funções assíncronas e Promise utilities
 * @module async
 */

import { Ok, Err, type Result } from './result.js';

// ============================================================================
// ASYNC COMPOSITION
// ============================================================================

/**
 * Versão assíncrona do pipe - compõe funções async da esquerda para direita
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: 'Alice' });
 * const getEmail = async (user: User) => user.email;
 * const sendEmail = async (email: string) => console.log(`Sent to ${email}`);
 *
 * await pipeAsync(fetchUser, getEmail, sendEmail)('user-123');
 */
/* eslint-disable no-redeclare */
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
 * Async compose — applies functions right-to-left (reverse of pipeAsync).
 * Does not mutate the input array.
 *
 * @example
 * const process = composeAsync(formatForClient, enrichWithRoles, fetchUser);
 * await process('user-123'); // fetchUser runs first
 */
export const composeAsync = (...fns: Array<(arg: unknown) => Promise<unknown>>) =>
  pipeAsync(...([...fns].reverse() as [(typeof fns)[0]]));

// ============================================================================
// ASYNC ARRAY TRANSFORMATIONS
// ============================================================================

/**
 * Map assíncrono - aplica função async a cada elemento em sequência
 *
 * @example
 * const fetchUserDetails = async (id: string) => ({ id, name: '...' });
 * await mapAsync(fetchUserDetails)(['1', '2', '3']);
 */
export const mapAsync =
  <T, R>(fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> => {
    const results: R[] = [];
    for (const item of arr) {
      results.push(await fn(item));
    }
    return results;
  };

/**
 * Map assíncrono paralelo - aplica função async a todos elementos em paralelo
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: '...' });
 * await mapParallel(fetchUser)(['1', '2', '3']);
 */
export const mapParallel =
  <T, R>(fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> =>
    Promise.all(arr.map(fn));

/**
 * Map assíncrono com limite de concorrência
 *
 * @example
 * const fetchUser = async (id: string) => ({ id, name: '...' });
 * // Processa 5 por vez
 * await mapConcurrent(5, fetchUser)(['1', '2', '3', ...]);
 */
export const mapConcurrent =
  <T, R>(concurrency: number, fn: (item: T) => Promise<R>) =>
  async (arr: T[]): Promise<R[]> => {
    const results: R[] = new Array(arr.length);
    const executing = new Set<Promise<void>>();

    for (const [index, item] of arr.entries()) {
      const promise: Promise<void> = fn(item).then(result => {
        results[index] = result;
        executing.delete(promise);
      });

      executing.add(promise);

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  };

/**
 * Filter assíncrono - filtra elementos com predicado async
 *
 * @example
 * const isActive = async (user: User) => {
 *   const status = await fetchStatus(user.id);
 *   return status === 'active';
 * };
 * await filterAsync(isActive)(users);
 */
export const filterAsync =
  <T>(predicate: (item: T) => Promise<boolean>) =>
  async (arr: T[]): Promise<T[]> => {
    const results: T[] = [];
    for (const item of arr) {
      if (await predicate(item)) {
        results.push(item);
      }
    }
    return results;
  };

/**
 * Reduce assíncrono - reduz array com função async
 *
 * @example
 * const sumBalances = async (acc: number, user: User) => {
 *   const balance = await fetchBalance(user.id);
 *   return acc + balance;
 * };
 * await reduceAsync(sumBalances, 0)(users);
 */
export const reduceAsync =
  <T, R>(fn: (acc: R, item: T) => Promise<R>, initial: R) =>
  async (arr: T[]): Promise<R> => {
    let result = initial;
    for (const item of arr) {
      result = await fn(result, item);
    }
    return result;
  };

// ============================================================================
// PROMISE UTILITIES
// ============================================================================

/**
 * Retry - tenta executar função com retry exponencial.
 * Retorna Result<T, Error> — nunca lança exceção.
 *
 * @example
 * const result = await retry(3, 1000)(fetchData); // 3 tentativas, 1s inicial
 * if (!result.ok) console.error(result.error.message);
 */
export const retry =
  <T>(maxAttempts: number, delayMs: number = 1000, backoff: number = 2) =>
  async (fn: () => Promise<T>): Promise<Result<T, Error>> => {
    let lastError: Error = new Error('no attempts made');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const value = await fn();
        return Ok(value);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoff, attempt - 1);
          await sleep(delay);
        }
      }
    }

    return Err(lastError);
  };

/**
 * Timeout - limita tempo de execução de Promise
 *
 * @example
 * const slowFetch = async () => fetch('/slow-endpoint');
 * await timeout(5000)(slowFetch()); // Falha se > 5s
 */
export const timeout =
  <T>(ms: number) =>
  async (promise: Promise<T>): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeoutPromise]);
  };

/**
 * Sleep - aguarda N milissegundos
 *
 * @example
 * await sleep(1000); // Aguarda 1 segundo
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debounce assíncrono - só executa após período de inatividade
 *
 * @example
 * const saveData = debounceAsync(500)(async (data) => {
 *   await api.save(data);
 * });
 *
 * // Só salva 500ms após última chamada
 * saveData(data1);
 * saveData(data2);
 * saveData(data3); // Apenas esta executará
 */
export const debounceAsync =
  <T extends unknown[], R>(delayMs: number) =>
  (fn: (...args: T) => Promise<R>) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let latestResolve: ((value: R) => void) | null = null;
    let latestReject: ((error: unknown) => void) | null = null;

    return (...args: T): Promise<R> => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return new Promise<R>((resolve, reject) => {
        latestResolve = resolve;
        latestReject = reject;

        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            latestResolve?.(result);
          } catch (error) {
            latestReject?.(error);
          }
        }, delayMs);
      });
    };
  };

/**
 * Throttle assíncrono - limita taxa de execução
 *
 * @example
 * const logEvent = throttleAsync(1000)(async (event) => {
 *   await api.log(event);
 * });
 *
 * // Máximo 1 chamada por segundo
 * logEvent(event1); // Executa
 * logEvent(event2); // Ignora
 * logEvent(event3); // Ignora
 */
export const throttleAsync =
  <T extends unknown[], R>(delayMs: number) =>
  (fn: (...args: T) => Promise<R>) => {
    let lastExecution = 0;
    let pending: Promise<R> | null = null;

    return async (...args: T): Promise<R> => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecution;

      if (timeSinceLastExecution >= delayMs) {
        lastExecution = now;
        pending = fn(...args);
        return pending;
      }

      if (pending) {
        return pending;
      }

      pending = fn(...args);
      return pending;
    };
  };

/**
 * Memoize assíncrono - cache de resultados de Promise.
 * Retorna Result<T, Error> — nunca relança exceção.
 *
 * @example
 * const fetchUser = memoizeAsync(async (id: string) => {
 *   return await api.getUser(id);
 * });
 *
 * const r1 = await fetchUser('123'); // API call → Ok(user)
 * const r2 = await fetchUser('123'); // Cached → Ok(user)
 */
export const memoizeAsync = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args)
) => {
  const cache = new Map<string, R>();

  return async (...args: T): Promise<Result<R, Error>> => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return Ok(cache.get(key)!);
    }

    try {
      const result = await fn(...args);
      cache.set(key, result);
      return Ok(result);
    } catch (err) {
      return Err(err instanceof Error ? err : new Error(String(err)));
    }
  };
};

/**
 * Sequence - executa array de funções async em sequência
 *
 * @example
 * const tasks = [
 *   async () => console.log('Task 1'),
 *   async () => console.log('Task 2'),
 *   async () => console.log('Task 3')
 * ];
 * await sequence(tasks); // Executa em ordem
 */
export const sequence = async <T>(fns: Array<() => Promise<T>>): Promise<T[]> => {
  const results: T[] = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
};

/**
 * Parallel - executa array de funções async em paralelo
 *
 * @example
 * const tasks = [
 *   async () => fetchUser('1'),
 *   async () => fetchUser('2'),
 *   async () => fetchUser('3')
 * ];
 * await parallel(tasks); // Executa simultaneamente
 */
export const parallel = async <T>(fns: Array<() => Promise<T>>): Promise<T[]> =>
  Promise.all(fns.map(fn => fn()));
