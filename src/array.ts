/**
 * Funções utilitárias para transformação funcional de arrays
 * @module array
 */

// ============================================================================
// ARRAY TRANSFORMATIONS
// ============================================================================

/**
 * Aplica função a cada elemento do array (curried)
 *
 * @example
 * const double = (x) => x * 2;
 * map(double)([1, 2, 3]); // [2, 4, 6]
 */
export const map =
  <T, R>(fn: (item: T) => R) =>
  (arr: T[]): R[] =>
    arr.map(fn);

/**
 * Filtra array baseado em predicado (curried)
 *
 * @example
 * const isEven = (x) => x % 2 === 0;
 * filter(isEven)([1, 2, 3, 4]); // [2, 4]
 */
export const filter =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T[] =>
    arr.filter(predicate);

/**
 * Reduz array a um único valor (curried)
 *
 * @example
 * const sum = (acc, x) => acc + x;
 * reduce(sum, 0)([1, 2, 3, 4]); // 10
 */
export const reduce =
  <T, R>(fn: (acc: R, item: T) => R, initial: R) =>
  (arr: T[]): R =>
    arr.reduce(fn, initial);

/**
 * Mapeia e achata array (flatMap curried)
 *
 * @example
 * const duplicate = (x) => [x, x];
 * flatMapArray(duplicate)([1, 2]); // [1, 1, 2, 2]
 */
export const flatMapArray =
  <T, R>(fn: (item: T) => R[]) =>
  (arr: T[]): R[] =>
    arr.flatMap(fn);

/**
 * Ordena array baseado em função de extração (curried)
 *
 * @example
 * const users = [{ name: 'Bob' }, { name: 'Alice' }];
 * sortBy(u => u.name)(users); // [{ name: 'Alice' }, { name: 'Bob' }]
 */
export const sortBy =
  <T>(fn: (item: T) => string | number) =>
  (arr: T[]): T[] =>
    [...arr].sort((a, b) => {
      const valA = fn(a);
      const valB = fn(b);
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

/**
 * Remove duplicados de array
 *
 * @example
 * unique()([1, 2, 2, 3, 1]); // [1, 2, 3]
 */
export const unique =
  <T>() =>
  (arr: T[]): T[] => [...new Set(arr)];

/**
 * Pega os primeiros N elementos de um array
 *
 * @example
 * take(2)([1, 2, 3, 4]); // [1, 2]
 */
export const take =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(0, n);

/**
 * Pula os primeiros N elementos de um array
 *
 * @example
 * skip(2)([1, 2, 3, 4]); // [3, 4]
 */
export const skip =
  (n: number) =>
  <T>(arr: T[]): T[] =>
    arr.slice(n);

/**
 * Encontra primeiro elemento que satisfaz predicado
 *
 * @example
 * const isEven = (x) => x % 2 === 0;
 * find(isEven)([1, 3, 4, 5]); // 4
 */
export const find =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): T | undefined =>
    arr.find(predicate);

/**
 * Verifica se algum elemento satisfaz predicado
 *
 * @example
 * const isEven = (x) => x % 2 === 0;
 * some(isEven)([1, 3, 5]); // false
 * some(isEven)([1, 2, 3]); // true
 */
export const some =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.some(predicate);

/**
 * Verifica se todos elementos satisfazem predicado
 *
 * @example
 * const isEven = (x) => x % 2 === 0;
 * every(isEven)([2, 4, 6]); // true
 * every(isEven)([2, 3, 4]); // false
 */
export const every =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): boolean =>
    arr.every(predicate);

/**
 * Agrupa elementos do array por chave
 *
 * @example
 * const users = [
 *   { name: 'Alice', role: 'admin' },
 *   { name: 'Bob', role: 'user' },
 *   { name: 'Charlie', role: 'admin' }
 * ];
 * groupBy((u) => u.role)(users);
 * // {
 * //   admin: [{ name: 'Alice', role: 'admin' }, { name: 'Charlie', role: 'admin' }],
 * //   user: [{ name: 'Bob', role: 'user' }]
 * // }
 */
export const groupBy =
  <T, K extends string | number>(fn: (item: T) => K) =>
  (arr: T[]): Record<K, T[]> => {
    const result = {} as Record<K, T[]>;
    for (const item of arr) {
      const key = fn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  };

/**
 * Conta ocorrências de cada elemento
 *
 * @example
 * countBy((x: number) => x % 2 === 0 ? 'even' : 'odd')([1, 2, 3, 4]);
 * // { odd: 2, even: 2 }
 */
export const countBy =
  <T, K extends string | number>(fn: (item: T) => K) =>
  (arr: T[]): Record<K, number> => {
    const result = {} as Record<K, number>;
    for (const item of arr) {
      const key = fn(item);
      result[key] = (result[key] || 0) + 1;
    }
    return result;
  };

/**
 * Particiona array em dois baseado em predicado
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * partition(isEven)([1, 2, 3, 4]);
 * // [[2, 4], [1, 3]]
 */
export const partition =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];
    for (const item of arr) {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }
    return [truthy, falsy];
  };

/**
 * Achata array em um nível
 *
 * @example
 * flatten()([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 */
export const flatten =
  <T>() =>
  (arr: T[][]): T[] =>
    arr.flat();

/**
 * Achata array profundamente
 *
 * @example
 * flattenDeep()([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
 */
export const flattenDeep =
  <T>() =>
  (arr: unknown[]): T[] =>
    arr.flat(Infinity) as T[];

/**
 * Zip - combina dois arrays em tuplas
 *
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c']);
 * // [[1, 'a'], [2, 'b'], [3, 'c']]
 */
export const zip = <T, U>(arr1: T[], arr2: U[]): Array<[T, U]> => {
  const length = Math.min(arr1.length, arr2.length);
  const result: Array<[T, U]> = [];
  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
};

/**
 * Unzip - separa array de tuplas em dois arrays
 *
 * @example
 * unzip([[1, 'a'], [2, 'b'], [3, 'c']]);
 * // [[1, 2, 3], ['a', 'b', 'c']]
 */
export const unzip = <T, U>(arr: Array<[T, U]>): [T[], U[]] => {
  const first: T[] = [];
  const second: U[] = [];
  for (const [a, b] of arr) {
    first.push(a);
    second.push(b);
  }
  return [first, second];
};

/**
 * Chunk - divide array em pedaços de tamanho N
 *
 * @example
 * chunk(2)([1, 2, 3, 4, 5]); // [[1, 2], [3, 4], [5]]
 */
export const chunk =
  (size: number) =>
  <T>(arr: T[]): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

/**
 * Removes falsy values from an array (null, undefined, false, 0, '').
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined]);
 * // [1, 2, 3]
 */
export const compact = <T>(arr: Array<T | null | undefined | false | 0 | ''>): T[] =>
  arr.filter(Boolean) as T[];

/**
 * Verifica se array tem elementos
 */
export const hasItems = <T>(arr: T[]): boolean => Array.isArray(arr) && arr.length > 0;
