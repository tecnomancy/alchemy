/**
 * Utilit\u00e1rios para manipula\u00e7\u00e3o funcional de objetos
 * @module object
 */

// ============================================================================
// OBJECT TRANSFORMATIONS
// ============================================================================

/**
 * Pick - seleciona propriedades de objeto
 *
 * @example
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };
 * pick(['name', 'email'])(user);
 * // { name: 'Alice', email: 'alice@example.com' }
 */
export const pick =
  <T extends object, K extends keyof T>(keys: K[]) =>
  (obj: T): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  };

/**
 * Omit - remove propriedades de objeto
 *
 * @example
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * omit(['password'])(user);
 * // { id: 1, name: 'Alice' }
 */
export const omit =
  <T extends object, K extends keyof T>(keys: K[]) =>
  (obj: T): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  };

/**
 * Merge - combina dois objetos (shallow)
 *
 * @example
 * const defaults = { theme: 'dark', lang: 'en' };
 * const userPrefs = { lang: 'pt' };
 * merge(defaults)(userPrefs);
 * // { theme: 'dark', lang: 'pt' }
 */
export const merge =
  <T extends object>(base: T) =>
  <U extends object>(override: U): T & U => ({
    ...base,
    ...override,
  });

/**
 * DeepMerge - combina objetos recursivamente
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2, d: 3 } };
 * const obj2 = { b: { d: 4, e: 5 } };
 * deepMerge(obj1)(obj2);
 * // { a: 1, b: { c: 2, d: 4, e: 5 } }
 */
export const deepMerge =
  <T extends object>(base: T) =>
  <U extends object>(override: U): T & U => {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

    for (const key in override) {
      const overrideValue = override[key];
      const baseValue = result[key];

      if (
        isObject(overrideValue) &&
        isObject(baseValue) &&
        !Array.isArray(overrideValue) &&
        !Array.isArray(baseValue)
      ) {
        result[key] = deepMerge(baseValue)(overrideValue);
      } else {
        result[key] = overrideValue;
      }
    }

    return result as T & U;
  };

/**
 * MapValues - mapeia valores de objeto
 *
 * @example
 * const prices = { apple: 10, banana: 5, orange: 8 };
 * mapValues((price: number) => price * 2)(prices);
 * // { apple: 20, banana: 10, orange: 16 }
 */
export const mapValues =
  <T extends object, R>(fn: (value: T[keyof T], key: keyof T) => R) =>
  (obj: T): Record<keyof T, R> => {
    const result = {} as Record<keyof T, R>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = fn(obj[key], key);
      }
    }
    return result;
  };

/**
 * MapKeys - mapeia chaves de objeto
 *
 * @example
 * const obj = { first_name: 'Alice', last_name: 'Smith' };
 * mapKeys((key: string) => key.replace('_', ''))(obj);
 * // { firstname: 'Alice', lastname: 'Smith' }
 */
export const mapKeys =
  <T extends object, K extends string>(fn: (key: keyof T) => K) =>
  (obj: T): Record<K, T[keyof T]> => {
    const result = {} as Record<K, T[keyof T]>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = fn(key);
        result[newKey] = obj[key];
      }
    }
    return result;
  };

/**
 * FilterKeys - filtra objeto por predicado de chave
 *
 * @example
 * const obj = { name: 'Alice', age: 30, _internal: true };
 * filterKeys((key: string) => !key.startsWith('_'))(obj);
 * // { name: 'Alice', age: 30 }
 */
export const filterKeys =
  <T extends object>(predicate: (key: keyof T) => boolean) =>
  (obj: T): Partial<T> => {
    const result = {} as Partial<T>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  };

/**
 * FilterValues - filtra objeto por predicado de valor
 *
 * @example
 * const obj = { a: 1, b: null, c: 3, d: undefined };
 * filterValues((v: unknown) => v != null)(obj);
 * // { a: 1, c: 3 }
 */
export const filterValues =
  <T extends object>(predicate: (value: T[keyof T]) => boolean) =>
  (obj: T): Partial<T> => {
    const result = {} as Partial<T>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (predicate(value)) {
          result[key] = value;
        }
      }
    }
    return result;
  };

// ============================================================================
// OBJECT QUERIES
// ============================================================================

/**
 * Keys - retorna chaves de objeto
 *
 * @example
 * keys({ a: 1, b: 2, c: 3 });
 * // ['a', 'b', 'c']
 */
export const keys = <T extends object>(obj: T): Array<keyof T> =>
  Object.keys(obj) as Array<keyof T>;

/**
 * Values - retorna valores de objeto
 *
 * @example
 * values({ a: 1, b: 2, c: 3 });
 * // [1, 2, 3]
 */
export const values = <T extends object>(obj: T): Array<T[keyof T]> => Object.values(obj);

/**
 * Entries - retorna pares [chave, valor]
 *
 * @example
 * entries({ a: 1, b: 2 });
 * // [['a', 1], ['b', 2]]
 */
export const entries = <T extends object>(obj: T): Array<[keyof T, T[keyof T]]> =>
  Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

/**
 * FromEntries - cria objeto a partir de pares [chave, valor]
 *
 * @example
 * fromEntries([['a', 1], ['b', 2]]);
 * // { a: 1, b: 2 }
 */
export const fromEntries = <K extends string, V>(entries: Array<[K, V]>): Record<K, V> =>
  Object.fromEntries(entries) as Record<K, V>;

/**
 * HasKey - verifica se objeto tem chave
 *
 * @example
 * hasKey('name')({ name: 'Alice', age: 30 });
 * // true
 */
export const hasKey =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): boolean =>
    key in obj;

/**
 * GetPath - extrai valor de caminho aninhado (type-safe)
 *
 * @example
 * const user = { profile: { name: 'Alice' } };
 * getPath(['profile', 'name'])(user);
 * // 'Alice'
 */
export const getPath =
  <T extends object>(path: string[]) =>
  (obj: T): unknown => {
    let result: unknown = obj;
    for (const key of path) {
      if (result == null) return undefined;
      result = (result as Record<string, unknown>)[key];
    }
    return result;
  };

/**
 * SetPath - define valor em caminho aninhado (imutável)
 *
 * @example
 * const user = { profile: { name: 'Alice' } };
 * setPath(['profile', 'name'], 'Bob')(user);
 * // { profile: { name: 'Bob' } }
 */
export const setPath =
  <T extends object>(path: string[], value: unknown) =>
  (obj: T): T => {
    if (path.length === 0) return obj;

    const [head, ...tail] = path;
    const currentValue = (obj as Record<string, unknown>)[head];

    if (tail.length === 0) {
      return {
        ...obj,
        [head]: value,
      } as T;
    }

    return {
      ...obj,
      [head]: setPath(tail, value)(isObject(currentValue) ? currentValue : {}),
    } as T;
  };

/**
 * UpdatePath - atualiza valor em caminho aninhado (imutável)
 *
 * @example
 * const user = { profile: { age: 30 } };
 * updatePath(['profile', 'age'], (age: number) => age + 1)(user);
 * // { profile: { age: 31 } }
 */
export const updatePath =
  <T extends object>(path: string[], fn: (value: unknown) => unknown) =>
  (obj: T): T => {
    const currentValue = getPath(path)(obj);
    const newValue = fn(currentValue);
    return setPath(path, newValue)(obj) as T;
  };

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * IsEmpty - verifica se objeto está vazio
 *
 * @example
 * isEmpty({}); // true
 * isEmpty({ a: 1 }); // false
 */
export const isEmpty = <T extends object>(obj: T): boolean => Object.keys(obj).length === 0;

/**
 * IsObject - verifica se é objeto (não array, não null)
 *
 * @example
 * isObject({}); // true
 * isObject([]); // false
 * isObject(null); // false
 */
export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Equals - comparação deep de objetos
 *
 * @example
 * equals({ a: 1, b: { c: 2 } })({ a: 1, b: { c: 2 } });
 * // true
 */
export const equals =
  <T extends object>(obj1: T) =>
  (obj2: T): boolean => {
    if (obj1 === obj2) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const val1 = (obj1 as Record<string, unknown>)[key];
      const val2 = (obj2 as Record<string, unknown>)[key];

      if (isObject(val1) && isObject(val2)) {
        if (!equals(val1)(val2)) return false;
      } else if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        for (let i = 0; i < val1.length; i++) {
          if (isObject(val1[i]) && isObject(val2[i])) {
            if (!equals(val1[i])(val2[i])) return false;
          } else if (val1[i] !== val2[i]) {
            return false;
          }
        }
      } else if (val1 !== val2) {
        return false;
      }
    }

    return true;
  };

/**
 * Clone - clona objeto profundamente
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = clone(original);
 * cloned.b.c = 999;
 * console.log(original.b.c); // 2 (não foi modificado)
 */
export const clone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => clone(item)) as T;
  }

  if (obj instanceof Object) {
    const clonedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = clone((obj as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as T;
  }

  return obj;
};

/**
 * Freeze - congela objeto profundamente (imutável)
 *
 * @example
 * const obj = freeze({ a: 1, b: { c: 2 } });
 * obj.a = 999; // Erro em strict mode
 * obj.b.c = 999; // Erro em strict mode
 */
export const freeze = <T extends object>(obj: T): Readonly<T> => {
  Object.freeze(obj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (isObject(value)) {
        freeze(value);
      }
    }
  }

  return obj;
};
