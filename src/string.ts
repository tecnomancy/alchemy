/**
 * Functional string utilities.
 * @module string
 */

export {
  toUpperCase,
  toLowerCase,
  trim,
  trimStart,
  trimEnd,
  split,
  join,
  replace,
  replaceAll,
  capitalize,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  titleCase,
  slice,
  substring,
  padStart,
  padEnd,
  repeat,
  reverse,
  truncate,
  words,
  lines,
  indent,
  dedent,
} from './_internal/string-transform.js';

export {
  startsWith,
  endsWith,
  includes,
  matches,
  isEmptyString,
  isBlank,
  length,
} from './_internal/string-query.js';

export {
  template,
  format,
} from './_internal/string-template.js';

export {
  isEmail,
  isUrl,
  isNumeric,
  isAlpha,
  isAlphanumeric,
  isHexColor,
  isUUID,
} from './_internal/string-validators.js';
