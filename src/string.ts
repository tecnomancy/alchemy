/**
 * Functional string utilities.
 * @module string
 */

// ============================================================================
// STRING TRANSFORMATIONS
// ============================================================================

/**
 * Converts a string to upper case.
 *
 * @example
 * toUpperCase('hello'); // 'HELLO'
 */
export const toUpperCase = (str: string): string => str.toUpperCase();

/**
 * Converts a string to lower case.
 *
 * @example
 * toLowerCase('HELLO'); // 'hello'
 */
export const toLowerCase = (str: string): string => str.toLowerCase();

/**
 * Removes leading and trailing whitespace.
 *
 * @example
 * trim('  hello  '); // 'hello'
 */
export const trim = (str: string): string => str.trim();

/**
 * Removes leading whitespace.
 *
 * @example
 * trimStart('  hello'); // 'hello'
 */
export const trimStart = (str: string): string => str.trimStart();

/**
 * Removes trailing whitespace.
 *
 * @example
 * trimEnd('hello  '); // 'hello'
 */
export const trimEnd = (str: string): string => str.trimEnd();

/**
 * Splits a string into an array by a separator (curried, data-last).
 *
 * @example
 * split(',')('a,b,c'); // ['a', 'b', 'c']
 */
export const split =
  (separator: string | RegExp) =>
  (str: string): string[] =>
    str.split(separator);

/**
 * Joins an array of strings with a separator (curried, data-last).
 *
 * @example
 * join(', ')(['a', 'b', 'c']); // 'a, b, c'
 */
export const join =
  (separator: string) =>
  (arr: string[]): string =>
    arr.join(separator);

/**
 * Replaces the first match of a search pattern (curried, data-last).
 *
 * @example
 * replace('hello', 'hi')('hello world'); // 'hi world'
 */
export const replace =
  (search: string | RegExp, replacement: string) =>
  (str: string): string =>
    str.replace(search, replacement);

/**
 * Replaces all matches of a search pattern (curried, data-last).
 *
 * @example
 * replaceAll('o', '0')('foo bar'); // 'f00 bar'
 */
export const replaceAll =
  (search: string | RegExp, replacement: string) =>
  (str: string): string =>
    str.replaceAll(search, replacement);

/**
 * Capitalizes the first character and lowercases the rest.
 *
 * @example
 * capitalize('hello world'); // 'Hello world'
 */
export const capitalize = (str: string): string =>
  str.length === 0 ? str : str[0].toUpperCase() + str.slice(1).toLowerCase();

/**
 * Converts a string to camelCase.
 *
 * @example
 * camelCase('hello world'); // 'helloWorld'
 * camelCase('hello_world'); // 'helloWorld'
 */
export const camelCase = (str: string): string =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

/**
 * Converts a string to PascalCase.
 *
 * @example
 * pascalCase('hello world'); // 'HelloWorld'
 */
export const pascalCase = (str: string): string => {
  const camel = camelCase(str);
  return camel.length === 0 ? camel : camel[0].toUpperCase() + camel.slice(1);
};

/**
 * Converts a string to snake_case.
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
 * Converts a string to kebab-case.
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
 * Capitalizes the first letter of each word.
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
 * Returns true if the string starts with the given substring (curried, data-last).
 *
 * @example
 * startsWith('hello')('hello world'); // true
 */
export const startsWith =
  (search: string) =>
  (str: string): boolean =>
    str.startsWith(search);

/**
 * Returns true if the string ends with the given substring (curried, data-last).
 *
 * @example
 * endsWith('world')('hello world'); // true
 */
export const endsWith =
  (search: string) =>
  (str: string): boolean =>
    str.endsWith(search);

/**
 * Returns true if the string contains the given substring (curried, data-last).
 *
 * @example
 * includes('llo')('hello'); // true
 */
export const includes =
  (search: string) =>
  (str: string): boolean =>
    str.includes(search);

/**
 * Returns true if the string matches the given regex (curried, data-last).
 *
 * @example
 * matches(/^\d+$/)('123'); // true
 */
export const matches =
  (regex: RegExp) =>
  (str: string): boolean =>
    regex.test(str);

/**
 * Returns true if the string has zero characters.
 *
 * @example
 * isEmptyString('');   // true
 * isEmptyString('  '); // false
 */
export const isEmptyString = (str: string): boolean => str.length === 0;

/**
 * Returns true if the string is empty or contains only whitespace.
 *
 * @example
 * isBlank('');   // true
 * isBlank('  '); // true
 */
export const isBlank = (str: string): boolean => str.trim().length === 0;

/**
 * Returns the number of characters in the string.
 *
 * @example
 * length('hello'); // 5
 */
export const length = (str: string): number => str.length;

// ============================================================================
// STRING MANIPULATION
// ============================================================================

/**
 * Extracts a section of the string (curried, data-last).
 *
 * @example
 * slice(0, 5)('hello world'); // 'hello'
 */
export const slice =
  (start: number, end?: number) =>
  (str: string): string =>
    str.slice(start, end);

/**
 * Extracts characters between two indices (curried, data-last).
 *
 * @example
 * substring(0, 5)('hello world'); // 'hello'
 */
export const substring =
  (start: number, end?: number) =>
  (str: string): string =>
    str.substring(start, end);

/**
 * Pads the start of a string to the target length (curried, data-last).
 *
 * @example
 * padStart(5, '0')('42'); // '00042'
 */
export const padStart =
  (length: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padStart(length, fillString);

/**
 * Pads the end of a string to the target length (curried, data-last).
 *
 * @example
 * padEnd(5, '0')('42'); // '42000'
 */
export const padEnd =
  (length: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padEnd(length, fillString);

/**
 * Repeats a string N times (curried, data-last).
 *
 * @example
 * repeat(3)('ha'); // 'hahaha'
 */
export const repeat =
  (count: number) =>
  (str: string): string =>
    str.repeat(count);

/**
 * Reverses the characters of a string.
 *
 * @example
 * reverse('hello'); // 'olleh'
 */
export const reverse = (str: string): string => Array.from(str).reverse().join('');

/**
 * Truncates a string to the given length, appending a suffix if cut.
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
 * Extracts all words from a string.
 *
 * @example
 * words('hello world'); // ['hello', 'world']
 */
export const words = (str: string): string[] => str.match(/\b\w+\b/g) || [];

/**
 * Splits a string into lines.
 *
 * @example
 * lines('hello\nworld'); // ['hello', 'world']
 */
export const lines = (str: string): string[] => str.split(/\r?\n/);

/**
 * Adds indentation to every line of a string (curried, data-last).
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
 * Removes the common leading whitespace from all lines.
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
 * Interpolates `{{key}}` placeholders using a values object (curried, data-last).
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
 * Formats a string using printf-style `%s` and `%d` placeholders (curried, data-last).
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
 * Returns true if the string is a valid email address.
 *
 * @example
 * isEmail('user@example.com'); // true
 */
export const isEmail = (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

/**
 * Returns true if the string is a valid URL.
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
 * Returns true if the string represents a finite number.
 *
 * @example
 * isNumeric('123');   // true
 * isNumeric('12.34'); // true
 * isNumeric('abc');   // false
 */
export const isNumeric = (str: string): boolean => !isNaN(Number(str)) && !isNaN(parseFloat(str));

/**
 * Returns true if the string contains only alphabetic characters.
 *
 * @example
 * isAlpha('hello');    // true
 * isAlpha('hello123'); // false
 */
export const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);

/**
 * Returns true if the string contains only alphanumeric characters.
 *
 * @example
 * isAlphanumeric('hello123'); // true
 */
export const isAlphanumeric = (str: string): boolean => /^[a-zA-Z0-9]+$/.test(str);

/**
 * Returns true if the string is a valid hexadecimal colour code.
 *
 * @example
 * isHexColor('#FF0000'); // true
 * isHexColor('#F00');    // true
 */
export const isHexColor = (str: string): boolean => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);

/**
 * Returns true if the string is a valid UUID (v1–v5).
 *
 * @example
 * isUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 */
export const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
