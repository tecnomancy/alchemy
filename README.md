# fp-core

**Functional programming primitives for TypeScript. Zero dependencies. Every type inferred.**

[![CI](https://github.com/roxdavirox/fp-core/actions/workflows/ci.yml/badge.svg)](https://github.com/roxdavirox/fp-core/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/fp-core)](https://www.npmjs.com/package/fp-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fp-core)](https://bundlephobia.com/package/fp-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Why fp-core?

| | fp-core | Ramda | fp-ts |
|---|---|---|---|
| TypeScript-native | yes | partial (bolted-on types) | yes |
| `pipe()` with per-step inference | yes | no (loses types past ~5 steps) | yes |
| `Result<T, E>` built-in | yes | no | yes (Either) |
| `Option<T>` built-in | yes | no | yes (Option) |
| Async-aware (`pipeAsync`, `retry`) | yes | no | partial (TaskEither) |
| Zero dependencies | yes | yes | yes |
| Learning curve | Low | Medium | High |
| Bundle (minzipped) | ~3 kb | ~14 kb | ~25 kb |
| Category Theory jargon | no | partial | yes (unavoidable) |

**fp-core is not a Haskell port. It's TypeScript-native FP for engineers who want to ship.**

---

## Install

```bash
npm install fp-core
# or
pnpm add fp-core
```

---

## Quick Start

```typescript
import { pipe, Ok, Err, Some, None, mapResult, flatMap, match } from 'fp-core';

// pipe — fully typed at every step
const result = pipe(
  '  Hello World  ',
  s => s.trim(),           // string → string
  s => s.toLowerCase(),    // string → string
  s => s.split(' '),       // string → string[]
  arr => arr.length,       // string[] → number
);
// result: 2  (TypeScript knows it's a number)

// Result — errors as values, no try/catch
const divide = (a: number, b: number) =>
  b === 0 ? Err('division by zero' as const) : Ok(a / b);

pipe(
  divide(10, 2),
  mapResult(n => n * 100),
  match(
    value => console.log('Result:', value), // 500
    error => console.error('Error:', error),
  ),
);

// Option — nullable without null checks
import { fromNullable, mapOption, unwrapOptionOr } from 'fp-core';

const getUser = (id: number) => fromNullable(users.find(u => u.id === id));

pipe(
  getUser(42),
  mapOption(u => u.name),
  unwrapOptionOr('Anonymous'),
); // 'Alice' or 'Anonymous'
```

---

## API Reference

### `pipe(value, ...fns)` — left-to-right composition

Pipes a value through up to 10 functions. **Every intermediate type is inferred.**

```typescript
import { pipe } from 'fp-core';

const result = pipe(
  [1, 2, 3, 4, 5],
  arr => arr.filter(n => n % 2 === 0), // number[] → number[]
  arr => arr.map(n => n * 10),          // number[] → number[]
  arr => arr.reduce((a, b) => a + b, 0), // number[] → number
  n => `Total: ${n}`,                    // number → string
);
// result: 'Total: 60'
```

> Ramda's `pipe` works point-free but loses TypeScript inference past ~5 steps.
> `fp-core/pipe` is value-first and infers up to 10 steps with full precision.

---

### `Result<T, E>` — errors as values

```typescript
import { Ok, Err, mapResult, flatMap, match, tryCatch, fromPromise } from 'fp-core';

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Construct
Ok(42)           // Result<number, never>
Err('not found') // Result<never, string>

// Transform
mapResult(n => n * 2)(Ok(5))    // Ok(10)
mapResult(n => n * 2)(Err('x')) // Err('x') — passes through

// Chain
const safeSqrt = (n: number) => n >= 0 ? Ok(Math.sqrt(n)) : Err('negative');
flatMap(safeSqrt)(Ok(16))  // Ok(4)
flatMap(safeSqrt)(Ok(-1))  // Err('negative')

// Pattern match
match(
  value => `success: ${value}`,
  error => `error: ${error}`,
)(Ok(42)); // 'success: 42'

// Wrap throwing functions
const safeParse = tryCatch(JSON.parse);
safeParse('{"a":1}') // Ok({ a: 1 })
safeParse('bad')     // Err(SyntaxError)

// Wrap Promises
const result = await fromPromise(fetch('/api/users'));
// Ok(Response) | Err(Error)
```

---

### `Option<T>` — explicit nullability

```typescript
import { Some, None, fromNullable, mapOption, flatMapOption, matchOption } from 'fp-core';

type Option<T> = { _tag: 'Some'; value: T } | { _tag: 'None' };

// Construct
Some(42)         // Option<number>
None             // Option<never>
fromNullable(null)      // None
fromNullable('hello')   // Some('hello')

// Transform
mapOption(n => n * 2)(Some(5)) // Some(10)
mapOption(n => n * 2)(None)    // None

// Chain
const safeSqrt = (n: number): Option<number> =>
  n >= 0 ? Some(Math.sqrt(n)) : None;

flatMapOption(safeSqrt)(Some(16)) // Some(4)
flatMapOption(safeSqrt)(Some(-1)) // None

// Pattern match
matchOption(
  value => `found: ${value}`,
  () => 'not found',
)(Some(42)); // 'found: 42'

// Interop with Result
import { optionToResult, resultToOption } from 'fp-core';
optionToResult(() => 'not found')(Some(42)) // Ok(42)
optionToResult(() => 'not found')(None)     // Err('not found')
```

---

### `compose(...fns)` — right-to-left

```typescript
import { compose } from 'fp-core';

const process = compose(
  (n: number) => `Result: ${n}`, // applied last
  (arr: number[]) => arr.reduce((a, b) => a + b, 0),
  (s: string) => s.split(',').map(Number), // applied first
);

process('1,2,3,4,5'); // 'Result: 15'
```

---

### Async — `pipeAsync`, `retry`, `mapConcurrent`

```typescript
import { pipeAsync, retry, mapConcurrent, tryCatchAsync } from 'fp-core';

// Async pipeline
const processUser = pipeAsync(
  fetchUser,       // (id: string) => Promise<User>
  enrichWithRoles, // (user: User) => Promise<UserWithRoles>
  formatForClient, // (user: UserWithRoles) => Promise<ClientUser>
);
await processUser('user-123');

// Retry with exponential backoff — returns Result, never throws
const result = await retry(3, 1000)(fetchUnstableApi);
if (!result.ok) console.error(result.error.message);

// Parallel with concurrency limit
const users = await mapConcurrent(5, fetchUser)(['1', '2', ..., '100']);
// processes 5 at a time

// Safe async — errors captured in Result
const safeUpload = tryCatchAsync(uploadFile);
const result = await safeUpload(blob); // Result<UploadResult, Error>
```

---

### Array utilities

All array functions are **curried** and **data-last** — designed for `pipe`.

```typescript
import { map, filter, reduce, groupBy, partition, chunk, sortBy } from 'fp-core';

pipe(
  [1, 2, 3, 4, 5, 6],
  filter(n => n % 2 === 0),      // [2, 4, 6]
  map(n => n * 10),               // [20, 40, 60]
  reduce((acc, n) => acc + n, 0), // 120
);

// groupBy
groupBy((u: User) => u.role)(users);
// { admin: [User, ...], viewer: [User, ...] }

// partition
const [evens, odds] = partition((n: number) => n % 2 === 0)([1, 2, 3, 4]);

// chunk
chunk(3)([1, 2, 3, 4, 5, 6, 7]); // [[1,2,3],[4,5,6],[7]]
```

---

### Object utilities

```typescript
import { pick, omit, merge, deepMerge, mapValues, setPath } from 'fp-core';

const user = { id: 1, name: 'Alice', password: 'secret', age: 30 };

pick(['id', 'name'])(user);    // { id: 1, name: 'Alice' }
omit(['password'])(user);       // { id: 1, name: 'Alice', age: 30 }

// Immutable nested update
const config = { db: { host: 'localhost', port: 5432 } };
setPath(['db', 'port'], 5433)(config);
// { db: { host: 'localhost', port: 5433 } } — original unchanged
```

---

### Predicates

All predicates are **composable** with `and`, `or`, `not`.

```typescript
import { and, or, not, isString, isNumber, between } from 'fp-core';

const isValidAge = and(isNumber, between(0, 150));
isValidAge(25);  // true
isValidAge(-1);  // false
isValidAge('x'); // false

const isAdminOrOwner = or(isAdmin, isOwner);
```

---

### String utilities

```typescript
import { camelCase, kebabCase, truncate, template } from 'fp-core';

camelCase('hello world')     // 'helloWorld'
kebabCase('helloWorld')      // 'hello-world'
truncate(10)('Hello, World!') // 'Hello, ...'

template({ name: 'Alice', role: 'admin' })('{{name}} is {{role}}')
// 'Alice is admin'
```

---

## Design Principles

1. **Value-first, not point-free.** `pipe(value, fn1, fn2)` instead of `pipe(fn1, fn2)(value)`. TypeScript loves this.
2. **Data-last currying.** All array/object utilities take data as the last argument so they compose naturally.
3. **Result over exceptions.** Functions that can fail return `Result<T, E>`. No hidden control flow.
4. **Option over null.** Functions that can return nothing return `Option<T>`. No accidental `undefined`.
5. **Zero magic.** No runtime reflection, no proxy traps, no hidden global state.
6. **Tree-shakeable.** Import only what you use — bundlers will shake the rest.

---

## Tree-shaking

fp-core is fully tree-shakeable. Each module is independently importable:

```typescript
// Only ships what you import
import { pipe, tap } from 'fp-core';
import { Ok, Err, mapResult } from 'fp-core';
import { Some, None, fromNullable } from 'fp-core';
import { pipeAsync, retry } from 'fp-core';
```

---

## TypeScript Requirements

- TypeScript ≥ 5.0
- `"moduleResolution": "bundler"` or `"node16"` / `"nodenext"`
- `"strict": true` recommended

---

## License

MIT © [roxdavirox](https://github.com/roxdavirox)
