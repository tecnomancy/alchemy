/**
 * Utilitários funcionais para manipulação de strings
 * @module string
 */

// ============================================================================
// STRING TRANSFORMATIONS
// ============================================================================

/**
 * ToUpperCase - converte para maiúsculas
 *
 * @example
 * toUpperCase('hello'); // 'HELLO'
 */
export const toUpperCase = (str: string): string => str.toUpperCase();

/**
 * ToLowerCase - converte para minúsculas
 *
 * @example
 * toLowerCase('HELLO'); // 'hello'
 */
export const toLowerCase = (str: string): string => str.toLowerCase();

/**
 * Trim - remove espaços em branco
 *
 * @example
 * trim('  hello  '); // 'hello'
 */
export const trim = (str: string): string => str.trim();

/**
 * TrimStart - remove espaços do início
 *
 * @example
 * trimStart('  hello'); // 'hello'
 */
export const trimStart = (str: string): string => str.trimStart();

/**
 * TrimEnd - remove espaços do final
 *
 * @example
 * trimEnd('hello  '); // 'hello'
 */
export const trimEnd = (str: string): string => str.trimEnd();

/**
 * Split - divide string em array
 *
 * @example
 * split(',')('a,b,c'); // ['a', 'b', 'c']
 */
export const split =
  (separator: string | RegExp) =>
  (str: string): string[] =>
    str.split(separator);

/**
 * Join - junta array em string
 *
 * @example
 * join(', ')(['a', 'b', 'c']); // 'a, b, c'
 */
export const join =
  (separator: string) =>
  (arr: string[]): string =>
    arr.join(separator);

/**
 * Replace - substitui substring
 *
 * @example
 * replace('hello', 'hi')('hello world'); // 'hi world'
 */
export const replace =
  (search: string | RegExp, replacement: string) =>
  (str: string): string =>
    str.replace(search, replacement);

/**
 * ReplaceAll - substitui todas ocorrências
 *
 * @example
 * replaceAll('o', '0')('foo'); // 'f00'
 */
export const replaceAll =
  (search: string | RegExp, replacement: string) =>
  (str: string): string =>
    str.replaceAll(search, replacement);

/**
 * Capitalize - primeira letra maiúscula
 *
 * @example
 * capitalize('hello world'); // 'Hello world'
 */
export const capitalize = (str: string): string =>
  str.length === 0 ? str : str[0].toUpperCase() + str.slice(1).toLowerCase();

/**
 * CamelCase - converte para camelCase
 *
 * @example
 * camelCase('hello world'); // 'helloWorld'
 * camelCase('hello_world'); // 'helloWorld'
 */
export const camelCase = (str: string): string =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

/**
 * PascalCase - converte para PascalCase
 *
 * @example
 * pascalCase('hello world'); // 'HelloWorld'
 */
export const pascalCase = (str: string): string => {
  const camel = camelCase(str);
  return camel.length === 0 ? camel : camel[0].toUpperCase() + camel.slice(1);
};

/**
 * SnakeCase - converte para snake_case
 *
 * @example
 * snakeCase('helloWorld'); // 'hello_world'
 */
export const snakeCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_');

/**
 * KebabCase - converte para kebab-case
 *
 * @example
 * kebabCase('helloWorld'); // 'hello-world'
 */
export const kebabCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/\s+/g, '-');

/**
 * TitleCase - primeira letra de cada palavra maiúscula
 *
 * @example
 * titleCase('hello world'); // 'Hello World'
 */
export const titleCase = (str: string): string =>
  str
    .toLowerCase()
    .split(' ')
    .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

// ============================================================================
// STRING QUERIES
// ============================================================================

/**
 * StartsWith - verifica se começa com substring
 *
 * @example
 * startsWith('hello')('hello world'); // true
 */
export const startsWith =
  (search: string) =>
  (str: string): boolean =>
    str.startsWith(search);

/**
 * EndsWith - verifica se termina com substring
 *
 * @example
 * endsWith('world')('hello world'); // true
 */
export const endsWith =
  (search: string) =>
  (str: string): boolean =>
    str.endsWith(search);

/**
 * Includes - verifica se contém substring
 *
 * @example
 * includes('llo')('hello'); // true
 */
export const includes =
  (search: string) =>
  (str: string): boolean =>
    str.includes(search);

/**
 * Matches - verifica se combina com regex
 *
 * @example
 * matches(/^\d+$/)('123'); // true
 */
export const matches =
  (regex: RegExp) =>
  (str: string): boolean =>
    regex.test(str);

/**
 * IsEmptyString - verifica se string está vazia
 *
 * @example
 * isEmptyString(''); // true
 * isEmptyString('  '); // false (tem espaços)
 */
export const isEmptyString = (str: string): boolean => str.length === 0;

/**
 * IsBlank - verifica se string está vazia ou só tem espaços
 *
 * @example
 * isBlank(''); // true
 * isBlank('  '); // true
 */
export const isBlank = (str: string): boolean => str.trim().length === 0;

/**
 * Length - retorna tamanho da string
 *
 * @example
 * length('hello'); // 5
 */
export const length = (str: string): number => str.length;

// ============================================================================
// STRING MANIPULATION
// ============================================================================

/**
 * Slice - extrai substring
 *
 * @example
 * slice(0, 5)('hello world'); // 'hello'
 */
export const slice =
  (start: number, end?: number) =>
  (str: string): string =>
    str.slice(start, end);

/**
 * Substring - extrai substring
 *
 * @example
 * substring(0, 5)('hello world'); // 'hello'
 */
export const substring =
  (start: number, end?: number) =>
  (str: string): string =>
    str.substring(start, end);

/**
 * PadStart - preenche início
 *
 * @example
 * padStart(5, '0')('42'); // '00042'
 */
export const padStart =
  (length: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padStart(length, fillString);

/**
 * PadEnd - preenche final
 *
 * @example
 * padEnd(5, '0')('42'); // '42000'
 */
export const padEnd =
  (length: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padEnd(length, fillString);

/**
 * Repeat - repete string N vezes
 *
 * @example
 * repeat(3)('ha'); // 'hahaha'
 */
export const repeat =
  (count: number) =>
  (str: string): string =>
    str.repeat(count);

/**
 * Reverse - inverte string
 *
 * @example
 * reverse('hello'); // 'olleh'
 */
export const reverse = (str: string): string => str.split('').reverse().join('');

/**
 * Truncate - trunca string com ellipsis
 *
 * @example
 * truncate(10)('hello world'); // 'hello w...'
 * truncate(10, '…')('hello world'); // 'hello wor…'
 */
export const truncate =
  (maxLength: number, suffix: string = '...') =>
  (str: string): string =>
    str.length <= maxLength ? str : str.slice(0, maxLength - suffix.length) + suffix;

/**
 * Words - extrai palavras
 *
 * @example
 * words('hello world'); // ['hello', 'world']
 */
export const words = (str: string): string[] => str.match(/\b\w+\b/g) || [];

/**
 * Lines - divide em linhas
 *
 * @example
 * lines('hello\nworld'); // ['hello', 'world']
 */
export const lines = (str: string): string[] => str.split(/\r?\n/);

/**
 * Indent - adiciona indentação
 *
 * @example
 * indent(2)('hello\nworld');
 * // '  hello\n  world'
 */
export const indent =
  (spaces: number, char: string = ' ') =>
  (str: string): string => {
    const indentation = char.repeat(spaces);
    return str
      .split('\n')
      .map(line => indentation + line)
      .join('\n');
  };

/**
 * Dedent - remove indentação comum
 *
 * @example
 * dedent('  hello\n  world');
 * // 'hello\nworld'
 */
export const dedent = (str: string): string => {
  const linesArray = str.split('\n');
  const nonEmptyLines = linesArray.filter(line => line.trim().length > 0);

  if (nonEmptyLines.length === 0) return str;

  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );

  return linesArray.map(line => line.slice(minIndent)).join('\n');
};

// ============================================================================
// TEMPLATE & INTERPOLATION
// ============================================================================

/**
 * Template - template string com substituições
 *
 * @example
 * template({ name: 'Alice', age: 30 })('Hello {{name}}, you are {{age}}');
 * // 'Hello Alice, you are 30'
 */
export const template =
  (values: Record<string, unknown>) =>
  (str: string): string =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`));

/**
 * Format - formata string estilo printf
 *
 * @example
 * format('Hello %s, you are %d years old')('Alice', 30);
 * // 'Hello Alice, you are 30 years old'
 */
export const format =
  (template: string) =>
  (...values: unknown[]): string => {
    let index = 0;
    return template.replace(/%[sd]/g, match => {
      const value = values[index++];
      if (match === '%s') return String(value);
      if (match === '%d') return String(Number(value));
      return match;
    });
  };

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * IsEmail - valida email
 *
 * @example
 * isEmail('user@example.com'); // true
 */
export const isEmail = (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

/**
 * IsUrl - valida URL
 *
 * @example
 * isUrl('https://example.com'); // true
 */
export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * IsNumeric - verifica se é numérico
 *
 * @example
 * isNumeric('123'); // true
 * isNumeric('12.34'); // true
 */
export const isNumeric = (str: string): boolean => !isNaN(Number(str)) && !isNaN(parseFloat(str));

/**
 * IsAlpha - apenas letras
 *
 * @example
 * isAlpha('hello'); // true
 * isAlpha('hello123'); // false
 */
export const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);

/**
 * IsAlphanumeric - letras e números
 *
 * @example
 * isAlphanumeric('hello123'); // true
 */
export const isAlphanumeric = (str: string): boolean => /^[a-zA-Z0-9]+$/.test(str);

/**
 * IsHexColor - valida cor hexadecimal
 *
 * @example
 * isHexColor('#FF0000'); // true
 * isHexColor('#F00'); // true
 */
export const isHexColor = (str: string): boolean => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);

/**
 * IsUUID - valida UUID
 *
 * @example
 * isUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 */
export const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
