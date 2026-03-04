# fp-core

**Functional programming primitives for TypeScript — every type inferred, zero dependencies.**

[![CI](https://github.com/roxdavirox/fp-core/actions/workflows/ci.yml/badge.svg)](https://github.com/roxdavirox/fp-core/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/fp-core)](https://www.npmjs.com/package/fp-core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fp-core)](https://bundlephobia.com/package/fp-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

fp-core is a TypeScript-native library for writing predictable, composable code.
It gives you a small set of well-defined primitives — `pipe`, `Result`, `Option`, and a
full suite of curried array, object, string, and async utilities — all with precise types
at every step and zero runtime dependencies.

---

## Why fp-core?

- **vs fp-ts** — same `Result`/`Option`/`pipe` primitives without HKT encoding or category-theory prerequisites. No `Functor`, `Monad`, or `Applicative` in your mental model — just named functions that compose.
- **vs Ramda** — value-first `pipe(value, f, g)` instead of `pipe(f, g)(value)`. TypeScript infers every intermediate type without losing precision across steps.
- **vs neverthrow** — `Result` + `Option` + `pipe` + async utilities + array/object/string helpers in one tree-shakeable package with no dependencies.
- **vs lodash/fp** — TypeScript-native from the ground up (no `any` leakage from overloads), with `Result` and `Option` built in to replace try/catch and null-check patterns structurally.

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

## What's included

- **`composition`** — `pipe`, `compose`, `flow`, `curry`, `memoize`, `tap`, `identity`, `constant`
- **`result`** — `Ok`, `Err`, `mapResult`, `flatMap`, `match`, `tryCatch`, `fromPromise`, `collectErrors`
- **`option`** — `Some`, `None`, `fromNullable`, `mapOption`, `flatMapOption`, `matchOption`, `unwrapOptionOr`
- **`async`** — `pipeAsync`, `retry`, `timeout`, `debounce`, `mapConcurrent`, `mapConcurrentResult`, `tryCatchAsync`
- **`array`** — `map`, `filter`, `reduce`, `groupBy`, `partition`, `chunk`, `sortBy`, `flatten`, `unique`
- **`object`** — `pick`, `omit`, `merge`, `deepMerge`, `mapValues`, `setPath`, `getPath`, `defaults`
- **`string`** — `camelCase`, `kebabCase`, `snakeCase`, `truncate`, `template`, `capitalize`
- **`predicates`** — `and`, `or`, `not`, `isString`, `isNumber`, `isNil`, `between`

---

## Quick Patterns

### Safe API call — errors as values, no try/catch

```typescript
import { fromPromise, flatMapAsync, match } from 'fp-core';

const getUser = async (id: string) => {
  const result = await fromPromise(fetch(`/api/users/${id}`).then(r => r.json()))
    .then(flatMapAsync(user => fromPromise(enrichUser(user))));

  return match(
    user  => ({ status: 'ok'    as const, user }),
    error => ({ status: 'error' as const, message: error.message }),
  )(result);
};
```

### Option null-safe navigation — no optional chaining noise

```typescript
import { pipe, fromNullable, flatMapOption, mapOption, unwrapOptionOr } from 'fp-core';

const getEventCoords = (user: User): string =>
  pipe(
    fromNullable(user.upcomingEvent),
    flatMapOption(e => fromNullable(e.location)),
    flatMapOption(l => fromNullable(l.coordinates)),
    mapOption(c => `${c.lat}, ${c.lng}`),
    unwrapOptionOr('Location unavailable'),
  );
```

### Form validation — accumulate all errors

```typescript
import { Ok, Err, collectErrors, match } from 'fp-core';

const validate = (form: SignupForm) =>
  match(
    ()       => ({ ok: true  as const, form }),
    (errors) => ({ ok: false as const, errors }),
  )(collectErrors([
    form.email.includes('@') ? Ok(form) : Err('Email is invalid'),
    form.password.length >= 8 ? Ok(form) : Err('Password too short'),
    form.age >= 18 ? Ok(form) : Err('Must be 18 or older'),
  ]));
```

→ [See all 10 recipes in docs/RECIPES.md](./docs/RECIPES.md)

---

## Design Principles

1. **Value-first, not point-free.** `pipe(value, fn1, fn2)` instead of `pipe(fn1, fn2)(value)`. TypeScript loves this.
2. **Data-last currying.** All array/object utilities take data as the last argument so they compose naturally.
3. **Result over exceptions.** Functions that can fail return `Result<T, E>`. No hidden control flow.
4. **Option over null.** Functions that can return nothing return `Option<T>`. No accidental `undefined`.
5. **Zero magic.** No runtime reflection, no proxy traps, no hidden global state.
6. **Tree-shakeable.** Import only what you use — bundlers will shake the rest.

---

## Subpath Imports

fp-core is fully tree-shakeable. Import the root `'fp-core'` for most use cases, or use subpath imports for explicit dependency tracking:

```typescript
import { Ok, Err, flatMap, mapResult } from 'fp-core/result';
import { Some, None, fromNullable } from 'fp-core/option';
import { pipe, compose, curry } from 'fp-core/composition';
import { pipeAsync, retry, timeout } from 'fp-core/async';
import { map, filter, groupBy } from 'fp-core/array';
import { pick, omit, setPath } from 'fp-core/object';
import { camelCase, truncate, template } from 'fp-core/string';
import { and, or, not, isString } from 'fp-core/predicates';
```

---

## Docs

- [API Reference](./docs/API.md) — full function signatures and examples
- [Recipes](./docs/RECIPES.md) — 10 real-world usage patterns
- [Migration Guide](./docs/MIGRATION.md) — coming from Ramda, fp-ts, or lodash/fp

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

| Change type | Version bump |
|-------------|-------------|
| Bugfix, doc update, internal refactor | Patch (`0.x.Y`) |
| New exported function, new subpath, new option | Minor (`0.X.0`) |
| Renamed/removed export, changed function signature, changed behavior | Major (`X.0.0`) |

Until `1.0.0`, minor releases may include breaking changes if they are clearly documented in the [CHANGELOG](./CHANGELOG.md).

---

## TypeScript Requirements

- TypeScript ≥ 5.0
- `"moduleResolution": "bundler"` or `"node16"` / `"nodenext"`
- `"strict": true` recommended

---

## License

MIT © [roxdavirox](https://github.com/roxdavirox)
