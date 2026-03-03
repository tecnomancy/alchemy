import { describe, it, expect } from 'vitest';
import {
  map, filter, reduce, flatMapArray,
  sortBy, unique, take, skip, find, some, every,
  groupBy, countBy, partition,
  flatten, flattenDeep,
  zip, unzip, chunk,
  compact, hasItems,
} from '../src/array.js';

describe('map', () => {
  it('transforms every element', () => {
    expect(map((x: number) => x * 2)([1, 2, 3])).toEqual([2, 4, 6]);
  });

  it('returns an empty array unchanged', () => {
    expect(map((x: number) => x * 2)([])).toEqual([]);
  });
});

describe('filter', () => {
  it('keeps elements that pass the predicate', () => {
    expect(filter((x: number) => x % 2 === 0)([1, 2, 3, 4])).toEqual([2, 4]);
  });

  it('returns empty when none pass', () => {
    expect(filter((x: number) => x > 10)([1, 2, 3])).toEqual([]);
  });
});

describe('reduce', () => {
  it('folds to a single value', () => {
    expect(reduce((acc: number, x: number) => acc + x, 0)([1, 2, 3, 4])).toBe(10);
  });

  it('returns the initial value for an empty array', () => {
    expect(reduce((acc: number, x: number) => acc + x, 0)([])).toBe(0);
  });
});

describe('flatMapArray', () => {
  it('maps and flattens one level', () => {
    expect(flatMapArray((x: number) => [x, x])([1, 2, 3])).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe('sortBy', () => {
  it('sorts by a string key, ascending', () => {
    const users = [{ name: 'Bob' }, { name: 'Alice' }, { name: 'Carol' }];
    expect(sortBy((u: { name: string }) => u.name)(users)).toEqual([
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Carol' },
    ]);
  });

  it('does not mutate the original array', () => {
    const arr = [3, 1, 2];
    sortBy((x: number) => x)(arr);
    expect(arr).toEqual([3, 1, 2]);
  });
});

describe('unique', () => {
  it('removes duplicate primitives', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
  });

  it('preserves insertion order', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });

  it('returns empty for empty input', () => {
    expect(unique([])).toEqual([]);
  });
});

describe('take', () => {
  it('returns the first N elements', () => {
    expect(take(2)([1, 2, 3, 4])).toEqual([1, 2]);
  });

  it('returns the whole array when N exceeds length', () => {
    expect(take(10)([1, 2])).toEqual([1, 2]);
  });

  it('returns empty when N is 0', () => {
    expect(take(0)([1, 2, 3])).toEqual([]);
  });
});

describe('skip', () => {
  it('drops the first N elements', () => {
    expect(skip(2)([1, 2, 3, 4])).toEqual([3, 4]);
  });

  it('returns empty when N exceeds length', () => {
    expect(skip(10)([1, 2])).toEqual([]);
  });
});

describe('find', () => {
  it('returns the first matching element', () => {
    expect(find((x: number) => x % 2 === 0)([1, 3, 4, 6])).toBe(4);
  });

  it('returns undefined when nothing matches', () => {
    expect(find((x: number) => x > 10)([1, 2, 3])).toBeUndefined();
  });
});

describe('some', () => {
  it('returns true when at least one element matches', () => {
    expect(some((x: number) => x > 3)([1, 2, 4])).toBe(true);
  });

  it('returns false when none match', () => {
    expect(some((x: number) => x > 10)([1, 2, 3])).toBe(false);
  });
});

describe('every', () => {
  it('returns true when all elements match', () => {
    expect(every((x: number) => x % 2 === 0)([2, 4, 6])).toBe(true);
  });

  it('returns false when any element fails', () => {
    expect(every((x: number) => x % 2 === 0)([2, 3, 4])).toBe(false);
  });
});

describe('groupBy', () => {
  it('groups by a key extractor', () => {
    const result = groupBy((x: number) => (x % 2 === 0 ? 'even' : 'odd'))([1, 2, 3, 4]);
    expect(result).toEqual({ odd: [1, 3], even: [2, 4] });
  });

  it('returns an empty object for empty input', () => {
    expect(groupBy((x: number) => x)([])).toEqual({});
  });
});

describe('countBy', () => {
  it('counts occurrences by key', () => {
    const result = countBy((x: number) => (x % 2 === 0 ? 'even' : 'odd'))([1, 2, 3, 4]);
    expect(result).toEqual({ odd: 2, even: 2 });
  });
});

describe('partition', () => {
  it('splits into passing and failing elements', () => {
    const [evens, odds] = partition((x: number) => x % 2 === 0)([1, 2, 3, 4, 5]);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it('returns two empty arrays for empty input', () => {
    expect(partition(() => true)([])).toEqual([[], []]);
  });
});

describe('flatten', () => {
  it('flattens one level', () => {
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });

  it('does not flatten beyond one level', () => {
    expect(flatten([[1, [2]], [3]])).toEqual([1, [2], 3]);
  });
});

describe('flattenDeep', () => {
  it('recursively flattens nested arrays', () => {
    expect(flattenDeep([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles already-flat arrays', () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe('zip', () => {
  it('combines two arrays into tuples', () => {
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('truncates to the shorter array', () => {
    expect(zip([1, 2], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b']]);
  });
});

describe('unzip', () => {
  it('splits tuples into two arrays', () => {
    const [nums, strs] = unzip([[1, 'a'], [2, 'b'], [3, 'c']]);
    expect(nums).toEqual([1, 2, 3]);
    expect(strs).toEqual(['a', 'b', 'c']);
  });
});

describe('chunk', () => {
  it('splits into chunks of the given size', () => {
    expect(chunk(2)([1, 2, 3, 4, 5])).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when size exceeds length', () => {
    expect(chunk(10)([1, 2, 3])).toEqual([[1, 2, 3]]);
  });

  it('returns empty for empty input', () => {
    expect(chunk(2)([])).toEqual([]);
  });
});

describe('compact', () => {
  it('removes all falsy values', () => {
    expect(compact([0, 1, false, 2, '', 3, null, undefined])).toEqual([1, 2, 3]);
  });

  it('leaves a fully truthy array unchanged', () => {
    expect(compact([1, 'a', true])).toEqual([1, 'a', true]);
  });
});

describe('hasItems', () => {
  it('returns true for a non-empty array', () => {
    expect(hasItems([1])).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(hasItems([])).toBe(false);
  });
});
