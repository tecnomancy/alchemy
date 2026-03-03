# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Subpath exports for granular imports (`fp-core/result`, `fp-core/option`, etc.)
- Full test suite for `array`, `object`, `string`, and `predicates` modules
- Coverage tests for `mapResultAsync`, `flatMapAsync`, `debounceAsync`, `throttleAsync`, `composeAsync`
- Coverage thresholds enforced in CI (90% lines/functions/statements, 85% branches)

### Fixed
- `composeAsync` no longer mutates the caller's function array (was calling `.reverse()` in-place)
- `unique`, `flatten`, `flattenDeep` removed unnecessary thunk layer (were `unique()([...])`, now `unique([...])`)

---

## [0.1.0] - 2026-03-03

### Added

**Core modules**

- `Result<T, E>` — type-safe error handling without exceptions
  - `Ok`, `Err`, `mapResult`, `mapError`, `flatMap`, `match`, `tryCatch`, `fromPromise`, `fromNullableResult`, `andThen`, `orElse`, `unwrapOr`, `isOk`, `isErr`, `toOption`, `validateAll`, `validateAny`, `tapResult`, `tapError`, `mapResultAsync`, `flatMapAsync`, `tryCatchAsync`, `fromPromiseResult`
- `Option<T>` — explicit nullability without null/undefined
  - `Some`, `None`, `fromNullable`, `mapOption`, `flatMapOption`, `matchOption`, `unwrapOptionOr`, `filterOption`, `optionToResult`, `resultToOption`, `tapOption`, `isSome`, `isNone`, `toNullable`

**Composition**

- `pipe(value, ...fns)` — left-to-right composition, fully typed up to 10 steps
- `compose(...fns)` — right-to-left composition
- `curry` — converts a multi-argument function to curried form
- `memoize` — caches function results by argument
- `tap` — executes a side effect and passes the value through
- `identity` — returns its argument unchanged
- `constant` — returns a function that always returns the same value
- `flow` — point-free left-to-right composition

**Async**

- `pipeAsync` — async left-to-right composition
- `composeAsync` — async right-to-left composition
- `mapAsync` — sequential async map
- `mapParallel` — parallel async map
- `mapConcurrent` — parallel async map with concurrency limit
- `filterAsync` — sequential async filter
- `reduceAsync` — sequential async reduce
- `retry` — retries with exponential backoff, returns `Result`
- `timeout` — races a promise against a deadline
- `sleep` — promise-based delay
- `debounceAsync` — debounced async function
- `throttleAsync` — throttled async function
- `memoizeAsync` — memoized async function returning `Result`
- `sequence` — runs async thunks sequentially
- `parallel` — runs async thunks in parallel

**Array**

- `map`, `filter`, `reduce`, `flatMapArray`, `sortBy`
- `unique`, `take`, `skip`, `find`, `some`, `every`
- `groupBy`, `countBy`, `partition`
- `flatten`, `flattenDeep`, `zip`, `unzip`, `chunk`, `compact`, `hasItems`

**Object**

- `pick`, `omit`, `merge`, `deepMerge`, `mapValues`, `filterValues`
- `fromEntries`, `toEntries`, `groupByKey`, `invertObject`
- `setPath`, `getPath`, `deletePath`
- `hasKey`, `hasProperty`, `isPlainObject`
- `keys`, `values`, `entries`

**String**

- `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`
- `capitalize`, `trim`, `trimStart`, `trimEnd`
- `startsWith`, `endsWith`, `includes` (curried)
- `truncate`, `padStart`, `padEnd`
- `split`, `join`, `replace`, `replaceAll` (curried)
- `template` — simple `{{variable}}` string interpolation
- `words`, `isEmpty`, `isBlank`, `toUpperCase`, `toLowerCase`

**Predicates**

- `and`, `or`, `not` — predicate combinators
- `isString`, `isNumber`, `isBoolean`, `isNull`, `isUndefined`, `isNullish`, `isDefined`
- `isArray`, `isObject`, `isFunction`, `isDate`, `isError`, `isPromise`
- `between`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `equals`
- `hasProperty` — type-guarded property check
- `hasLength`, `isEmpty` (for arrays/strings/objects)
- `validateAll`, `validateAny` — run multiple predicates and collect results

**Infrastructure**

- TypeScript 5.x, `"moduleResolution": "bundler"`, strict mode
- Vitest test suite with v8 coverage
- GitHub Actions CI (type-check → test → build, Node 20 + 22)
- Automated npm publish on tag push

[Unreleased]: https://github.com/roxdavirox/fp-core/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/roxdavirox/fp-core/releases/tag/v0.1.0
