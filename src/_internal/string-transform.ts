/**
 * String transformation helpers: case conversion, manipulation, padding, etc.
 * @internal
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
  str.length === 0 ? str : str[0]!.toUpperCase() + str.slice(1).toLowerCase();

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
  return camel.length === 0 ? camel : camel[0]!.toUpperCase() + camel.slice(1);
};

/**
 * Splits a string into lowercase words.
 * Handles camelCase, PascalCase, kebab-case, snake_case, Title Case,
 * and any combination of these formats.
 */
const splitWords = (str: string): string[] =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')       // camelCase → "camel Case"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser → "XML Parser"
    .split(/[\s_-]+/)
    .map(w => w.toLowerCase())
    .filter(Boolean);

/**
 * Converts a string to snake_case.
 * Accepts any common format: camelCase, PascalCase, kebab-case, space-separated.
 *
 * @example
 * snakeCase('helloWorld');   // 'hello_world'
 * snakeCase('hello-world');  // 'hello_world'
 * snakeCase('Hello World');  // 'hello_world'
 * snakeCase('XMLParser');    // 'xml_parser'
 */
export const snakeCase = (str: string): string => splitWords(str).join('_');

/**
 * Converts a string to kebab-case.
 * Accepts any common format: camelCase, PascalCase, snake_case, space-separated.
 *
 * @example
 * kebabCase('helloWorld');   // 'hello-world'
 * kebabCase('hello_world');  // 'hello-world'
 * kebabCase('Hello World');  // 'hello-world'
 * kebabCase('XMLParser');    // 'xml-parser'
 */
export const kebabCase = (str: string): string => splitWords(str).join('-');

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
    .map(word => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(' ');

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
  (targetLength: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padStart(targetLength, fillString);

/**
 * Pads the end of a string to the target length (curried, data-last).
 *
 * @example
 * padEnd(5, '0')('42'); // '42000'
 */
export const padEnd =
  (targetLength: number, fillString: string = ' ') =>
  (str: string): string =>
    str.padEnd(targetLength, fillString);

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
 * Reverses the characters of a string. Correctly handles multi-codepoint characters.
 *
 * @example
 * reverse('hello'); // 'olleh'
 * reverse('cafe\u0301'); // handles combining characters
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
      return match ? match[1]!.length : 0;
    })
  );

  return linesArray.map(line => line.slice(minIndent)).join('\n');
};
