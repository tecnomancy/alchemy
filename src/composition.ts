/**
 * Functional composition utilities
 *
 * Strongly-typed pipe/compose with per-step type inference up to 10 steps.
 * Unlike Ramda, every intermediate type is inferred — no `any` leakage.
 *
 * @module composition
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
// UTILITIES
// ============================================================================

/**
 * Retorna sempre o valor passado (identity function)
 *
 * @example
 * identity(5); // 5
 * [1, 2, 3].map(identity); // [1, 2, 3]
 */
export const identity = <T>(value: T): T => value;

/**
 * Retorna sempre uma constante, ignorando argumentos
 *
 * @example
 * const always42 = constant(42);
 * always42('anything'); // 42
 */
export const constant =
  <T>(value: T) =>
  (..._args: unknown[]): T =>
    value;

/**
 * Extrai propriedade de objeto (curried)
 *
 * @example
 * const getName = prop('name');
 * getName({ name: 'Alice', age: 30 }); // 'Alice'
 */
export const prop =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): T[K] | undefined =>
    obj?.[key];

/**
 * Currying - transforma função multi-argumento em funções de único argumento
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 * curriedAdd(1)(2)(3); // 6
 * curriedAdd(1, 2)(3); // 6
 */
export const curry = <T extends unknown[], R>(
  fn: (...args: T) => R
): ((...args: readonly unknown[]) => unknown) => {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn(...(args as T));
    }
    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  };
};
/**
 * Partial - aplicação parcial de argumentos
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const add5 = partial(add, 5);
 * add5(3, 2); // 10
 */
export const partial =
  <T extends unknown[], R>(fn: (...args: T) => R, ...partialArgs: unknown[]) =>
  (...remainingArgs: unknown[]): R =>
    fn(...([...partialArgs, ...remainingArgs] as T));

/**
 * Flip - inverte ordem dos argumentos de função binária
 *
 * @example
 * const divide = (a: number, b: number) => a / b;
 * const flippedDivide = flip(divide);
 * divide(10, 2); // 5
 * flippedDivide(2, 10); // 5
 */
export const flip =
  <A, B, R>(fn: (a: A, b: B) => R) =>
  (b: B, a: A): R =>
    fn(a, b);

/**
 * Tap - executa função side-effect e retorna valor original
 *
 * @example
 * pipe(
 *   (x) => x * 2,
 *   tap(console.log), // Loga 10
 *   (x) => x + 3
 * )(5); // 13
 */
export const tap =
  <T>(fn: (value: T) => void) =>
  (value: T): T => {
    fn(value);
    return value;
  };

/**
 * Memoize - cache de resultados de função pura
 *
 * @example
 * const slowFn = (n: number) => {
 *   // computação cara
 *   return n * 2;
 * };
 * const fastFn = memoize(slowFn);
 * fastFn(5); // Calcula
 * fastFn(5); // Cache
 */
export const memoize = <T extends unknown[], R>(
  fn: (...args: T) => R,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args)
): ((...args: T) => R) => {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Once - função que só executa uma vez
 *
 * @example
 * const init = once(() => console.log('Initialized'));
 * init(); // Loga 'Initialized'
 * init(); // Nada acontece
 */
export const once = <T extends unknown[], R>(fn: (...args: T) => R) => {
  let called = false;
  let result: R;

  return (...args: T): R => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
};

/**
 * After - executa função apenas após N chamadas
 *
 * @example
 * const log = after(3, () => console.log('Called 3 times'));
 * log(); // Nada
 * log(); // Nada
 * log(); // Loga 'Called 3 times'
 */
export const after = <T extends unknown[], R>(n: number, fn: (...args: T) => R) => {
  let count = 0;

  return (...args: T): R | undefined => {
    count++;
    if (count >= n) {
      return fn(...args);
    }
    return undefined;
  };
};

/**
 * Before - executa função apenas antes de N chamadas
 *
 * @example
 * const log = before(3, () => console.log('First 2 calls'));
 * log(); // Loga
 * log(); // Loga
 * log(); // Nada (returns last result)
 */
export const before = <T extends unknown[], R>(n: number, fn: (...args: T) => R) => {
  let count = 0;
  let result: R | undefined;

  return (...args: T): R | undefined => {
    if (count < n - 1) {
      result = fn(...args);
      count++;
    }
    return result;
  };
};

/**
 * Negate - retorna função que nega o resultado de predicado
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * const isOdd = negate(isEven);
 * isOdd(3); // true
 */
export const negate =
  <T extends unknown[]>(predicate: (...args: T) => boolean) =>
  (...args: T): boolean =>
    !predicate(...args);
