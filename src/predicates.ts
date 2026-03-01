/**
 * Predicados e funções de validação
 * @module predicates
 */

// ============================================================================
// BASIC PREDICATES
// ============================================================================

/**
 * Verifica se string não está vazia (após trim)
 *
 * @example
 * isNotEmpty('hello'); // true
 * isNotEmpty('');      // false
 * isNotEmpty('   ');   // false
 */
export const isNotEmpty = (str: string): boolean => str != null && str.trim().length > 0;

/**
 * Verifica se valor não é null nem undefined
 *
 * @example
 * isNotNull(0);         // true
 * isNotNull('');        // true
 * isNotNull(null);      // false
 * isNotNull(undefined); // false
 */
export const isNotNull = <T>(value: T | null | undefined): value is T => value != null;

/**
 * Verifica se objeto tem propriedade com valor não-null
 *
 * @example
 * const hasName = hasProperty<User, 'name'>('name');
 * hasName({ name: 'Alice' }); // true
 * hasName({ age: 30 });       // false
 */
export const hasProperty =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): boolean =>
    key in obj && obj[key] != null;

// ============================================================================
// LOGICAL COMBINATORS
// ============================================================================

/**
 * Inverte um predicado
 *
 * @example
 * const isEven = (x) => x % 2 === 0;
 * const isOdd = not(isEven);
 * isOdd(3); // true
 */
export const not =
  <T>(predicate: (value: T) => boolean) =>
  (value: T): boolean =>
    !predicate(value);

/**
 * Combina predicados com AND lógico
 *
 * @example
 * const isPositive = (x) => x > 0;
 * const isEven = (x) => x % 2 === 0;
 * const isPositiveEven = and(isPositive, isEven);
 * isPositiveEven(4);  // true
 * isPositiveEven(-2); // false
 */
export const and =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    predicates.every(p => p(value));

/**
 * Combina predicados com OR lógico
 *
 * @example
 * const isZero = (x) => x === 0;
 * const isNegative = (x) => x < 0;
 * const isZeroOrNegative = or(isZero, isNegative);
 * isZeroOrNegative(0);  // true
 * isZeroOrNegative(-5); // true
 * isZeroOrNegative(5);  // false
 */
export const or =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    predicates.some(p => p(value));

/**
 * XOR lógico - exatamente um predicado deve ser verdadeiro
 *
 * @example
 * const isEven = (x: number) => x % 2 === 0;
 * const isPositive = (x: number) => x > 0;
 * const xorPred = xor(isEven, isPositive);
 * xorPred(2);  // false (ambos verdadeiros)
 * xorPred(3);  // true (apenas isPositive)
 * xorPred(-2); // true (apenas isEven)
 */
export const xor =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean => {
    const trueCount = predicates.filter(p => p(value)).length;
    return trueCount === 1;
  };

/**
 * NAND - negação de AND
 *
 * @example
 * const isPositive = (x: number) => x > 0;
 * const isEven = (x: number) => x % 2 === 0;
 * const nandPred = nand(isPositive, isEven);
 * nandPred(4);  // false (ambos verdadeiros)
 * nandPred(3);  // true
 */
export const nand =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    !predicates.every(p => p(value));

/**
 * NOR - negação de OR
 *
 * @example
 * const isPositive = (x: number) => x > 0;
 * const isEven = (x: number) => x % 2 === 0;
 * const norPred = nor(isPositive, isEven);
 * norPred(-3); // true (nenhum verdadeiro)
 * norPred(4);  // false
 */
export const nor =
  <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean =>
    !predicates.some(p => p(value));

// ============================================================================
// COMPARISON PREDICATES
// ============================================================================

/**
 * Maior que
 *
 * @example
 * const greaterThan10 = gt(10);
 * greaterThan10(15); // true
 * greaterThan10(5);  // false
 */
export const gt =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value > threshold;

/**
 * Maior ou igual
 *
 * @example
 * const gte10 = gte(10);
 * gte10(10); // true
 * gte10(11); // true
 */
export const gte =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value >= threshold;

/**
 * Menor que
 *
 * @example
 * const lt10 = lt(10);
 * lt10(5); // true
 * lt10(15); // false
 */
export const lt =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value < threshold;

/**
 * Menor ou igual
 *
 * @example
 * const lte10 = lte(10);
 * lte10(10); // true
 * lte10(9);  // true
 */
export const lte =
  <T>(threshold: T) =>
  (value: T): boolean =>
    value <= threshold;

/**
 * Igual
 *
 * @example
 * const is42 = eq(42);
 * is42(42); // true
 * is42(43); // false
 */
export const eq =
  <T>(target: T) =>
  (value: T): boolean =>
    value === target;

/**
 * Diferente
 *
 * @example
 * const notZero = neq(0);
 * notZero(1);  // true
 * notZero(0);  // false
 */
export const neq =
  <T>(target: T) =>
  (value: T): boolean =>
    value !== target;

/**
 * Entre dois valores (inclusivo)
 *
 * @example
 * const between1And10 = between(1, 10);
 * between1And10(5);  // true
 * between1And10(0);  // false
 * between1And10(11); // false
 */
export const between =
  <T>(min: T, max: T) =>
  (value: T): boolean =>
    value >= min && value <= max;

// ============================================================================
// TYPE PREDICATES
// ============================================================================

/**
 * Verifica se é string
 *
 * @example
 * isString('hello'); // true
 * isString(42);      // false
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Verifica se é número
 *
 * @example
 * isNumber(42);    // true
 * isNumber('42');  // false
 * isNumber(NaN);   // true
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number';

/**
 * Verifica se é boolean
 *
 * @example
 * isBoolean(true);  // true
 * isBoolean(false); // true
 * isBoolean(1);     // false
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Verifica se é função
 *
 * @example
 * isFunction(() => {}); // true
 * isFunction(42);       // false
 */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function';

/**
 * Verifica se é array
 *
 * @example
 * isArray([1, 2, 3]); // true
 * isArray({ 0: 1 });  // false
 */
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

/**
 * Verifica se é null
 *
 * @example
 * isNull(null); // true
 * isNull(undefined); // false
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Verifica se é undefined
 *
 * @example
 * isUndefined(undefined); // true
 * isUndefined(null);      // false
 */
export const isUndefined = (value: unknown): value is undefined => value === undefined;

/**
 * Verifica se é null ou undefined
 *
 * @example
 * isNil(null);      // true
 * isNil(undefined); // true
 * isNil(0);         // false
 */
export const isNil = (value: unknown): value is null | undefined => value == null;

/**
 * Verifica se é Date válido
 *
 * @example
 * isDate(new Date()); // true
 * isDate('2023-01-01'); // false
 */
export const isDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime());

/**
 * Verifica se é RegExp
 *
 * @example
 * isRegExp(/test/); // true
 * isRegExp('test'); // false
 */
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/**
 * Verifica se é Promise
 *
 * @example
 * isPromise(Promise.resolve()); // true
 * isPromise({});                // false
 */
export const isPromise = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise ||
  (typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).then === 'function');

// ============================================================================
// NUMERIC PREDICATES
// ============================================================================

/**
 * Verifica se é número par
 *
 * @example
 * isEven(4); // true
 * isEven(3); // false
 */
export const isEven = (n: number): boolean => n % 2 === 0;

/**
 * Verifica se é número ímpar
 *
 * @example
 * isOdd(3); // true
 * isOdd(4); // false
 */
export const isOdd = (n: number): boolean => n % 2 !== 0;

/**
 * Verifica se é positivo
 *
 * @example
 * isPositive(5);  // true
 * isPositive(-5); // false
 * isPositive(0);  // false
 */
export const isPositive = (n: number): boolean => n > 0;

/**
 * Verifica se é negativo
 *
 * @example
 * isNegative(-5); // true
 * isNegative(5);  // false
 */
export const isNegative = (n: number): boolean => n < 0;

/**
 * Verifica se é zero
 *
 * @example
 * isZero(0);  // true
 * isZero(0.0); // true
 * isZero(1);  // false
 */
export const isZero = (n: number): boolean => n === 0;

/**
 * Verifica se é inteiro
 *
 * @example
 * isInteger(42);   // true
 * isInteger(42.5); // false
 */
export const isInteger = (n: number): boolean => Number.isInteger(n);

/**
 * Verifica se é NaN
 *
 * @example
 * isNaN(NaN);       // true
 * isNaN(Number.NaN); // true
 * isNaN(0);         // false
 */
export const isNaN = (n: number): boolean => Number.isNaN(n);

/**
 * Verifica se é finito
 *
 * @example
 * isFinite(42);       // true
 * isFinite(Infinity); // false
 */
export const isFinite = (n: number): boolean => Number.isFinite(n);

/**
 * Verifica se é infinito
 *
 * @example
 * isInfinite(Infinity);  // true
 * isInfinite(-Infinity); // true
 * isInfinite(42);        // false
 */
export const isInfinite = (n: number): boolean => !Number.isFinite(n) && !Number.isNaN(n);
