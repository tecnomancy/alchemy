import { describe, it, expect } from 'vitest';
import {
  pick, omit, merge, deepMerge,
  mapValues, mapKeys, filterKeys, filterValues,
  keys, values, entries, fromEntries,
  hasKey, getPath, setPath, updatePath,
  isEmpty, isObject, equals, clone, freeze,
  deepEquals, deepClone,
} from '../src/object.js';

describe('pick', () => {
  type User = { id: number; name: string; password: string };
  const user: User = { id: 1, name: 'Alice', password: 'secret' };

  it('returns only the selected keys', () => {
    expect(pick<User, 'id' | 'name'>(['id', 'name'])(user)).toEqual({ id: 1, name: 'Alice' });
  });

  it('ignores keys not present in the object', () => {
    const obj: { a: number } = { a: 1 };
    expect(pick<typeof obj, 'a'>(['a'])(obj)).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  type User = { id: number; name: string; password: string };
  const user: User = { id: 1, name: 'Alice', password: 'secret' };

  it('excludes the specified keys', () => {
    expect(omit<User, 'password'>(['password'])(user)).toEqual({ id: 1, name: 'Alice' });
  });
});

describe('merge', () => {
  it('merges two objects shallowly, override wins', () => {
    const defaults = { theme: 'dark', lang: 'en' };
    const overrides = { lang: 'pt' };
    expect(merge(defaults)(overrides)).toEqual({ theme: 'dark', lang: 'pt' });
  });

  it('does not mutate the base object', () => {
    const base = { a: 1 };
    merge(base)({ b: 2 });
    expect(base).toEqual({ a: 1 });
  });
});

describe('deepMerge', () => {
  it('recursively merges nested objects', () => {
    const base = { a: 1, b: { c: 2, d: 3 } };
    const override = { b: { d: 4, e: 5 } };
    expect(deepMerge(base)(override)).toEqual({ a: 1, b: { c: 2, d: 4, e: 5 } });
  });

  it('does not deep-merge arrays — override replaces', () => {
    const base = { list: [1, 2, 3] };
    const override = { list: [4, 5] };
    expect(deepMerge(base)(override)).toEqual({ list: [4, 5] });
  });
});

describe('mapValues', () => {
  it('transforms every value', () => {
    const prices = { apple: 10, banana: 5 };
    expect(mapValues((v: number) => v * 2)(prices)).toEqual({ apple: 20, banana: 10 });
  });
});

describe('mapKeys', () => {
  it('transforms every key', () => {
    const obj = { a: 1, b: 2 };
    expect(mapKeys((k) => String(k).toUpperCase())(obj)).toEqual({ A: 1, B: 2 });
  });
});

describe('filterKeys', () => {
  it('keeps keys that pass the predicate', () => {
    const obj = { name: 'Alice', _id: 1, _secret: 'x' };
    expect(filterKeys((k) => !String(k).startsWith('_'))(obj)).toEqual({ name: 'Alice' });
  });
});

describe('filterValues', () => {
  it('keeps values that pass the predicate', () => {
    const obj = { a: 1, b: null, c: 3, d: undefined };
    expect(filterValues((v: unknown) => v != null)(obj)).toEqual({ a: 1, c: 3 });
  });
});

describe('keys / values / entries / fromEntries', () => {
  const obj = { a: 1, b: 2 };

  it('keys returns the object keys', () => {
    expect(keys(obj)).toEqual(['a', 'b']);
  });

  it('values returns the object values', () => {
    expect(values(obj)).toEqual([1, 2]);
  });

  it('entries returns [key, value] pairs', () => {
    expect(entries(obj)).toEqual([['a', 1], ['b', 2]]);
  });

  it('fromEntries reconstructs an object', () => {
    expect(fromEntries([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
  });

  it('entries and fromEntries are inverse', () => {
    expect(fromEntries(entries(obj) as [string, number][])).toEqual(obj);
  });
});

describe('hasKey', () => {
  type Person = { name: string; age: number };

  it('returns true when the key exists', () => {
    const person: Person = { name: 'Alice', age: 30 };
    expect(hasKey<Person, 'name'>('name')(person)).toBe(true);
  });

  it('returns false when the key is absent', () => {
    type PersonWithEmail = Person & { email?: string };
    const person: PersonWithEmail = { name: 'Alice', age: 30 };
    expect(hasKey<PersonWithEmail, 'email'>('email')(person)).toBe(false);
  });
});

describe('getPath', () => {
  it('retrieves a nested value', () => {
    const obj = { user: { profile: { name: 'Alice' } } };
    expect(getPath(['user', 'profile', 'name'])(obj)).toBe('Alice');
  });

  it('returns undefined for a missing path', () => {
    expect(getPath(['a', 'b', 'c'])({ a: {} })).toBeUndefined();
  });
});

describe('setPath', () => {
  it('returns a new object with the value set', () => {
    const obj = { user: { name: 'Alice' } };
    const result = setPath(['user', 'name'], 'Bob')(obj);
    expect(result).toEqual({ user: { name: 'Bob' } });
  });

  it('does not mutate the original', () => {
    const obj = { a: { b: 1 } };
    setPath(['a', 'b'], 99)(obj);
    expect(obj.a.b).toBe(1);
  });
});

describe('updatePath', () => {
  it('applies a function to the value at a path', () => {
    const obj = { stats: { count: 5 } };
    const result = updatePath(['stats', 'count'], (n) => (n as number) + 1)(obj);
    expect(result).toEqual({ stats: { count: 6 } });
  });
});

describe('isEmpty', () => {
  it('returns true for an empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for a non-empty object', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject(42)).toBe(false);
    expect(isObject('str')).toBe(false);
  });
});

describe('equals', () => {
  it('returns true for structurally equal objects', () => {
    expect(equals({ a: 1, b: { c: 2 } })({ a: 1, b: { c: 2 } })).toBe(true);
  });

  it('returns false when values differ', () => {
    expect(equals({ a: 1 })({ a: 2 })).toBe(false);
  });

  it('returns false when keys differ', () => {
    expect(equals({ a: 1 } as object)({ a: 1, b: 2 } as object)).toBe(false);
  });

  it('handles nested arrays of primitives', () => {
    expect(equals({ list: [1, 2, 3] })({ list: [1, 2, 3] })).toBe(true);
    expect(equals({ list: [1, 2] })({ list: [1, 3] })).toBe(false);
  });

  it('handles nested arrays of objects', () => {
    expect(equals({ list: [{ a: 1 }] })({ list: [{ a: 1 }] })).toBe(true);
    expect(equals({ list: [{ a: 1 }] })({ list: [{ a: 2 }] })).toBe(false);
  });

  it('returns false for arrays of different length', () => {
    expect(equals({ list: [1, 2, 3] })({ list: [1, 2] })).toBe(false);
  });
});

describe('clone', () => {
  it('produces a deep copy', () => {
    const original = { a: 1, b: { c: 2 } };
    const copy = clone(original);
    (copy.b as { c: number }).c = 999;
    expect(original.b.c).toBe(2);
  });

  it('clones arrays of primitives', () => {
    const arr = [1, [2, 3]];
    const copy = clone(arr);
    (copy[1] as number[])[0] = 99;
    expect((arr[1] as number[])[0]).toBe(2);
  });

  it('clones arrays of objects (recursive)', () => {
    const arr = [{ x: 1 }, { x: 2 }];
    const copy = clone(arr);
    copy[0].x = 99;
    expect(arr[0].x).toBe(1);
  });

  it('clones Date objects', () => {
    const d = new Date('2024-01-01');
    const copy = clone(d);
    expect(copy.getTime()).toBe(d.getTime());
    expect(copy).not.toBe(d);
  });
});

describe('freeze', () => {
  it('makes the object immutable', () => {
    const obj = freeze({ a: 1, b: { c: 2 } });
    expect(() => {
      (obj as { a: number }).a = 99;
    }).toThrow();
  });
});

describe('deepEquals', () => {
  it('equal primitives', () => expect(deepEquals(1)(1)).toBe(true));
  it('unequal primitives', () => expect(deepEquals(1)(2)).toBe(false));
  it('null equals null', () => expect(deepEquals(null)(null)).toBe(true));
  it('undefined equals undefined', () => expect(deepEquals(undefined)(undefined)).toBe(true));
  it('nested plain objects', () => expect(deepEquals({ x: { y: 1 } })({ x: { y: 1 } })).toBe(true));
  it('nested objects — mismatch', () => expect(deepEquals({ x: { y: 1 } })({ x: { y: 2 } })).toBe(false));
  it('arrays', () => expect(deepEquals([1, 2, 3])([1, 2, 3])).toBe(true));
  it('nested arrays', () => expect(deepEquals([1, [2, 3]])([1, [2, 3]])).toBe(true));
  it('array length mismatch', () => expect(deepEquals([1, 2])([1, 2, 3])).toBe(false));
  it('Date equal', () => expect(deepEquals(new Date('2020-01-01'))(new Date('2020-01-01'))).toBe(true));
  it('Date unequal', () => expect(deepEquals(new Date('2020-01-01'))(new Date('2021-01-01'))).toBe(false));
  it('RegExp equal', () => expect(deepEquals(/foo/gi)(/foo/gi)).toBe(true));
  it('RegExp unequal flags', () => expect(deepEquals(/foo/g)(/foo/i)).toBe(false));
  it('Map equal', () => expect(deepEquals(new Map([['a', 1]]))(new Map([['a', 1]]))).toBe(true));
  it('Map unequal', () => expect(deepEquals(new Map([['a', 1]]))(new Map([['a', 2]]))).toBe(false));
  it('Set equal', () => expect(deepEquals(new Set([1, 2]))(new Set([1, 2]))).toBe(true));
  it('Set unequal', () => expect(deepEquals(new Set([1, 2]))(new Set([1, 3]))).toBe(false));
  it('circular reference — mirrored', () => {
    const a: Record<string, unknown> = {};
    a['self'] = a;
    const b: Record<string, unknown> = {};
    b['self'] = b;
    expect(deepEquals(a)(b)).toBe(true);
  });
  it('circular reference — different', () => {
    const a: Record<string, unknown> = { x: 1 };
    a['self'] = a;
    const b: Record<string, unknown> = { x: 2 };
    b['self'] = b;
    expect(deepEquals(a)(b)).toBe(false);
  });
});

describe('deepClone', () => {
  it('primitives pass through', () => expect(deepClone(42)).toBe(42));
  it('null passes through', () => expect(deepClone(null)).toBe(null));
  it('nested object is independent', () => {
    const obj = { a: { b: 2 } };
    const copy = deepClone(obj);
    copy.a.b = 99;
    expect(obj.a.b).toBe(2);
  });
  it('nested array is independent', () => {
    const arr = [[1, 2], [3, 4]];
    const copy = deepClone(arr);
    copy[0][0] = 99;
    expect(arr[0][0]).toBe(1);
  });
  it('Date is cloned by value', () => {
    const d = new Date('2020-01-01');
    const copy = deepClone(d);
    expect(copy.getTime()).toBe(d.getTime());
    expect(copy).not.toBe(d);
  });
  it('RegExp is cloned', () => {
    const r = /foo/gi;
    const copy = deepClone(r);
    expect(copy.source).toBe(r.source);
    expect(copy.flags).toBe(r.flags);
    expect(copy).not.toBe(r);
  });
  it('Map is cloned deeply', () => {
    const m = new Map([['a', { x: 1 }]]);
    const copy = deepClone(m);
    copy.get('a')!.x = 99;
    expect(m.get('a')!.x).toBe(1);
  });
  it('Set is cloned', () => {
    const s = new Set([1, 2, 3]);
    const copy = deepClone(s);
    expect(copy).not.toBe(s);
    expect([...copy]).toEqual([1, 2, 3]);
  });
  it('circular reference is reproduced', () => {
    const obj: Record<string, unknown> = { x: 1 };
    obj['self'] = obj;
    const copy = deepClone(obj) as Record<string, unknown>;
    expect(copy['self']).toBe(copy);
    expect(copy).not.toBe(obj);
  });
});
