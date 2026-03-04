# Migration Guide

→ [Coming from Ramda](#coming-from-ramda)
→ [Coming from fp-ts](#coming-from-fp-ts)
→ [Coming from lodash/fp](#coming-from-lodasfp)

---

## Coming from Ramda

| Ramda | fp-core |
|-------|---------|
| `R.pipe(f, g)(x)` | `pipe(x, f, g)` |
| `R.compose(g, f)(x)` | `compose(g, f)(x)` |
| `R.map(fn, list)` | `map(fn)(list)` |
| `R.filter(pred, list)` | `filter(pred)(list)` |
| `R.reduce(fn, init, list)` | `reduce(fn, init)(list)` |
| `R.groupBy(fn, list)` | `groupBy(fn)(list)` |
| `R.sortBy(fn, list)` | `sortBy(fn)(list)` |
| `R.pick(['a','b'], obj)` | `pick(['a','b'])(obj)` |
| `R.omit(['a'], obj)` | `omit(['a'])(obj)` |
| `R.mergeRight(a, b)` | `merge(a)(b)` |
| `R.either(f, g)` | `or(f, g)` — predicates module |
| `R.both(f, g)` | `and(f, g)` — predicates module |
| `R.complement(f)` | `not(f)` |
| `R.memoize(f)` | `memoize(f)` |
| `R.tap(fn)(x)` | `tap(fn)(x)` |
| `R.curry(f)` | `curry(f)` |
| `R.identity` | `identity` |
| `R.always(x)` | `constant(x)` |

Key differences:
- **Value-first pipe**: `pipe(value, f, g)` instead of `pipe(f, g)(value)`. TypeScript infers every step without losing types.
- **No `Maybe`/`Either`**: fp-core uses `Option<T>` and `Result<T, E>` with explicit constructors.
- **No lens/transducer**: fp-core is intentionally limited to everyday utilities.

---

## Coming from fp-ts

| fp-ts | fp-core |
|-------|---------|
| `pipe(x, TE.map(f))` | `pipe(x, mapResult(f))` |
| `E.right(x)` / `E.left(e)` | `Ok(x)` / `Err(e)` |
| `E.map(f)(either)` | `mapResult(f)(result)` |
| `E.chain(f)(either)` | `flatMap(f)(result)` |
| `E.fold(onLeft, onRight)` | `match(onRight, onLeft)` |
| `O.some(x)` / `O.none` | `Some(x)` / `None` |
| `O.map(f)(option)` | `mapOption(f)(option)` |
| `O.chain(f)(option)` | `flatMapOption(f)(option)` |
| `O.fold(onNone, onSome)` | `matchOption(onSome, onNone)` |
| `O.fromNullable(x)` | `fromNullable(x)` |
| `TE.tryCatch(f, toError)` | `tryCatchAsync(f)` |
| `T.sequenceArray(tasks)` | `sequence(tasks)` |
| `A.map(f)(arr)` | `map(f)(arr)` |
| `A.filter(pred)(arr)` | `filter(pred)(arr)` |
| `flow(f, g)` | `flow(f, g)` or `pipe(x, f, g)` |

Key differences:
- **No HKT encoding**: fp-core does not use higher-kinded type emulation. The API is simpler but less polymorphic.
- **No type class hierarchy**: there is no `Functor`, `Monad`, or `Applicative` abstraction — each type has its own named functions.
- **`match` argument order**: fp-core uses `match(onOk, onErr)` (success first), while fp-ts uses `fold(onLeft, onRight)` (failure first).

---

## Coming from lodash/fp

| lodash/fp | fp-core |
|-----------|---------|
| `_.map(fn)(arr)` | `map(fn)(arr)` |
| `_.filter(pred)(arr)` | `filter(pred)(arr)` |
| `_.reduce(fn)(init)(arr)` | `reduce(fn, init)(arr)` |
| `_.groupBy(fn)(arr)` | `groupBy(fn)(arr)` |
| `_.sortBy(fn)(arr)` | `sortBy(fn)(arr)` |
| `_.chunk(n)(arr)` | `chunk(n)(arr)` |
| `_.flatten(arr)` | `flatten(arr)` |
| `_.flattenDeep(arr)` | `flattenDeep(arr)` |
| `_.uniq(arr)` | `unique(arr)` |
| `_.pick(keys)(obj)` | `pick(keys)(obj)` |
| `_.omit(keys)(obj)` | `omit(keys)(obj)` |
| `_.merge(a)(b)` | `deepMerge(a)(b)` |
| `_.camelCase(s)` | `camelCase(s)` |
| `_.kebabCase(s)` | `kebabCase(s)` |
| `_.truncate({length: n})(s)` | `truncate(n)(s)` |
| `_.flow(f, g)` | `flow(f, g)` |
| `_.memoize(f)` | `memoize(f)` |
| `_.identity` | `identity` |
| `_.constant(x)` | `constant(x)` |

Key differences:
- **TypeScript-native**: every function is typed precisely; no `any` leakage from lodash's overloads.
- **No `_` namespace or chaining**: compose pipelines with `pipe` instead.
- **Result/Option built-in**: fp-core replaces try/catch and null-check patterns structurally.
