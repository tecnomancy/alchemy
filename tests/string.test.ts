import { describe, it, expect } from 'vitest';
import {
  toUpperCase, toLowerCase, trim, trimStart, trimEnd,
  split, join, replace, replaceAll,
  capitalize, camelCase, pascalCase, snakeCase, kebabCase, titleCase,
  startsWith, endsWith, includes, matches,
  isEmptyString, isBlank, length,
  slice, substring, padStart, padEnd, repeat, reverse,
  truncate, words, lines, indent, dedent,
  template, format,
  isEmail, isUrl, isNumeric, isAlpha, isAlphanumeric, isHexColor, isUUID,
} from '../src/string.js';

describe('case transformations', () => {
  it('toUpperCase', () => expect(toUpperCase('hello')).toBe('HELLO'));
  it('toLowerCase', () => expect(toLowerCase('HELLO')).toBe('hello'));

  it('capitalize — lowercases the rest', () => {
    expect(capitalize('hELLO wORLD')).toBe('Hello world');
  });

  it('camelCase from space-separated', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
  });

  it('camelCase from underscore-separated', () => {
    expect(camelCase('hello_world')).toBe('helloWorld');
  });

  it('pascalCase', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld');
  });

  it('snakeCase from camelCase', () => {
    expect(snakeCase('helloWorld')).toBe('hello_world');
  });

  it('kebabCase from camelCase', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world');
  });

  it('titleCase', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });
});

describe('trim', () => {
  it('trim removes surrounding whitespace', () => expect(trim('  hi  ')).toBe('hi'));
  it('trimStart removes leading whitespace', () => expect(trimStart('  hi')).toBe('hi'));
  it('trimEnd removes trailing whitespace', () => expect(trimEnd('hi  ')).toBe('hi'));
});

describe('split / join', () => {
  it('split splits by separator', () => {
    expect(split(',')('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('join joins with separator', () => {
    expect(join(', ')(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('split then join is identity for simple cases', () => {
    expect(join('-')(split('-')('a-b-c'))).toBe('a-b-c');
  });
});

describe('replace / replaceAll', () => {
  it('replace substitutes first occurrence', () => {
    expect(replace('o', '0')('foo')).toBe('f0o');
  });

  it('replaceAll substitutes all occurrences', () => {
    expect(replaceAll('o', '0')('foo')).toBe('f00');
  });
});

describe('query predicates', () => {
  it('startsWith', () => {
    expect(startsWith('he')('hello')).toBe(true);
    expect(startsWith('wo')('hello')).toBe(false);
  });

  it('endsWith', () => {
    expect(endsWith('lo')('hello')).toBe(true);
    expect(endsWith('he')('hello')).toBe(false);
  });

  it('includes', () => {
    expect(includes('ell')('hello')).toBe(true);
    expect(includes('xyz')('hello')).toBe(false);
  });

  it('matches', () => {
    expect(matches(/^\d+$/)('123')).toBe(true);
    expect(matches(/^\d+$/)('12a')).toBe(false);
  });

  it('isEmptyString', () => {
    expect(isEmptyString('')).toBe(true);
    expect(isEmptyString('  ')).toBe(false);
  });

  it('isBlank', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank('a')).toBe(false);
  });

  it('length', () => {
    expect(length('hello')).toBe(5);
    expect(length('')).toBe(0);
  });
});

describe('slice / substring / pad / repeat / reverse', () => {
  it('slice', () => expect(slice(1, 4)('hello')).toBe('ell'));
  it('substring', () => expect(substring(0, 3)('hello')).toBe('hel'));
  it('padStart', () => expect(padStart(5, '0')('42')).toBe('00042'));
  it('padEnd', () => expect(padEnd(5, '0')('42')).toBe('42000'));
  it('repeat', () => expect(repeat(3)('ha')).toBe('hahaha'));
  it('reverse', () => expect(reverse('hello')).toBe('olleh'));
  it('reverse preserves multi-codepoint characters (emoji)', () => {
    expect(reverse('😀ab')).toBe('ba😀');
  });
});

describe('truncate', () => {
  it('truncates strings longer than maxLength', () => {
    expect(truncate(8)('hello world')).toBe('hello...');
  });

  it('leaves strings within maxLength unchanged', () => {
    expect(truncate(20)('hello')).toBe('hello');
  });

  it('supports a custom suffix', () => {
    expect(truncate(6, '…')('hello world')).toBe('hello…');
  });
});

describe('words / lines', () => {
  it('words extracts word tokens', () => {
    expect(words('hello world foo')).toEqual(['hello', 'world', 'foo']);
  });

  it('lines splits on newlines', () => {
    expect(lines('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });

  it('lines handles CRLF', () => {
    expect(lines('a\r\nb')).toEqual(['a', 'b']);
  });
});

describe('indent / dedent', () => {
  it('indent adds spaces to every line', () => {
    expect(indent(2)('a\nb')).toBe('  a\n  b');
  });

  it('dedent removes common leading whitespace', () => {
    expect(dedent('  hello\n  world')).toBe('hello\nworld');
  });
});

describe('template', () => {
  it('replaces {{key}} placeholders', () => {
    expect(template({ name: 'Alice', role: 'admin' })('{{name}} is {{role}}')).toBe('Alice is admin');
  });

  it('leaves unknown placeholders as-is', () => {
    expect(template({})('hello {{name}}')).toBe('hello {{name}}');
  });
});

describe('format', () => {
  it('replaces %s tokens', () => {
    expect(format('Hello %s')('Alice')).toBe('Hello Alice');
  });

  it('replaces %d tokens', () => {
    expect(format('Score: %d')(42)).toBe('Score: 42');
  });

  it('replaces %s and %d tokens in sequence', () => {
    expect(format('Hello %s, you are %d')('Alice', 30)).toBe('Hello Alice, you are 30');
  });
});

describe('validation', () => {
  it('isEmail', () => {
    expect(isEmail('user@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
  });

  it('isUrl', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('not a url')).toBe(false);
  });

  it('isNumeric', () => {
    expect(isNumeric('123')).toBe(true);
    expect(isNumeric('12.5')).toBe(true);
    expect(isNumeric('abc')).toBe(false);
  });

  it('isAlpha', () => {
    expect(isAlpha('hello')).toBe(true);
    expect(isAlpha('hello1')).toBe(false);
  });

  it('isAlphanumeric', () => {
    expect(isAlphanumeric('hello123')).toBe(true);
    expect(isAlphanumeric('hello!')).toBe(false);
  });

  it('isHexColor', () => {
    expect(isHexColor('#FF0000')).toBe(true);
    expect(isHexColor('#F00')).toBe(true);
    expect(isHexColor('FF0000')).toBe(false);
  });

  it('isUUID', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUUID('not-a-uuid')).toBe(false);
  });
});
