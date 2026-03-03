# fp-core API Reference

Complete reference for all exported functions, organized by module.

**Import styles**

```typescript
// Root barrel — everything
import { pipe, Ok, Err, Some, None } from 'fp-core';

// Subpath — one module
import { Ok, Err, flatMap } from 'fp-core/result';
import { pipe, compose } from 'fp-core/composition';
```

---

## Table of Contents

- [Result\<T, E\>](#resultt-e)
- [Option\<T\>](#optiont)
- [Composition](#composition)
- [Async](#async)
- [Array](#array)
- [Object](#object)
- [String](#string)
- [Predicates](#predicates)

---

## Result\<T, E\>

`import { ... } from 'fp-core/result'`

Represents a value that is either a success (`Ok`) or a failure (`Err`).
Use `Result` instead of throwing exceptions for expected failure paths.

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

### Constructors

---

#### `Ok(value)`

Creates a successful `Result`.

**Signature:** `<T, E = Error>(value: T) => Result<T, E>`

**Example:**
```typescript
Ok(42);          // { ok: true, value: 42 }
Ok('hello');     // { ok: true, value: 'hello' }
```

---

#### `Err(error)`

Creates a failed `Result`.

**Signature:** `<T, E = Error>(error: E) => Result<T, E>`

**Example:**
```typescript
Err('not found');          // { ok: false, error: 'not found' }
Err(new Error('failed'));  // { ok: false, error: Error }
```

---

### Type Guards

---

#### `isOk(result)`

Returns `true` if the result is `Ok`, narrowing the type.

**Signature:** `<T, E>(result: Result<T, E>) => result is { ok: true; value: T }`

**Example:**
```typescript
const r = Ok(42);
if (isOk(r)) {
  console.log(r.value); // TypeScript knows r.value exists
}
```

---

#### `isErr(result)`

Returns `true` if the result is `Err`, narrowing the type.

**Signature:** `<T, E>(result: Result<T, E>) => result is { ok: false; error: E }`

**Example:**
```typescript
const r = Err('oops');
if (isErr(r)) {
  console.log(r.error); // TypeScript knows r.error exists
}
```

---

### Transformations

---

#### `mapResult(fn)(result)`

Applies `fn` to the value if `Ok`; passes `Err` through unchanged.

**Signature:** `<T, R, E>(fn: (value: T) => R) => (result: Result<T, E>) => Result<R, E>`

**Example:**
```typescript
mapResult((x: number) => x * 2)(Ok(5));    // Ok(10)
mapResult((x: number) => x * 2)(Err('x')); // Err('x')
```

**See also:** `mapResultAsync`, `mapErr`

---

#### `mapErr(fn)(result)`

Applies `fn` to the error if `Err`; passes `Ok` through unchanged.

**Signature:** `<T, E, F>(fn: (error: E) => F) => (result: Result<T, E>) => Result<T, F>`

**Example:**
```typescript
mapErr((e: Error) => e.message)(Err(new Error('oops'))); // Err('oops')
mapErr((e: Error) => e.message)(Ok(42));                 // Ok(42)
```

---

#### `flatMap(fn)(result)` / `andThen`

Chains operations that can themselves fail. Avoids nested `Result<Result<T>>`.

**Signature:** `<T, R, E>(fn: (value: T) => Result<R, E>) => (result: Result<T, E>) => Result<R, E>`

**Example:**
```typescript
const safeDivide = (n: number) =>
  n === 0 ? Err('division by zero') : Ok(100 / n);

pipe(Ok(5),  flatMap(safeDivide)); // Ok(20)
pipe(Ok(0),  flatMap(safeDivide)); // Err('division by zero')
pipe(Err('x'), flatMap(safeDivide)); // Err('x') — short-circuits
```

**See also:** `flatMapAsync`, `mapResult`

---

#### `match(onOk, onErr)(result)`

Pattern-matches over a `Result`, consuming both branches.

**Signature:** `<T, E, R>(onOk: (value: T) => R, onErr: (error: E) => R) => (result: Result<T, E>) => R`

**Example:**
```typescript
const message = match(
  (value: number) => `got ${value}`,
  (error: string) => `failed: ${error}`,
);
message(Ok(42));    // 'got 42'
message(Err('x'));  // 'failed: x'
```

---

#### `unwrapOr(defaultValue)(result)`

Extracts the value if `Ok`, or returns `defaultValue` if `Err`.

**Signature:** `<T, E>(defaultValue: T) => (result: Result<T, E>) => T`

**Example:**
```typescript
unwrapOr(0)(Ok(42));   // 42
unwrapOr(0)(Err('x')); // 0
```

---

#### `unwrapOrElse(fn)(result)`

Extracts the value if `Ok`, or computes a fallback from the error if `Err`.

**Signature:** `<T, E>(fn: (error: E) => T) => (result: Result<T, E>) => T`

**Example:**
```typescript
unwrapOrElse((e: string) => e.length)(Ok(42));    // 42
unwrapOrElse((e: string) => e.length)(Err('hi')); // 2
```

---

#### `unwrap(result)`

Extracts the value or throws the error. Prefer `unwrapOr` or `match` in production.

**Signature:** `<T, E>(result: Result<T, E>) => T`

**Example:**
```typescript
unwrap(Ok(42));         // 42
unwrap(Err('oops'));    // throws 'oops'
```

---

### Combinators

---

#### `combineTwo(fn)(r1, r2)`

Applies `fn` to both values if both results are `Ok`; returns the first `Err` otherwise.

**Signature:** `<T1, T2, R, E>(fn: (v1: T1, v2: T2) => R) => (r1: Result<T1, E>, r2: Result<T2, E>) => Result<R, E>`

**Example:**
```typescript
combineTwo((a: number, b: number) => a + b)(Ok(10), Ok(5)); // Ok(15)
combineTwo((a: number, b: number) => a + b)(Err('x'), Ok(5)); // Err('x')
```

---

#### `combineAll(results)`

Collects an array of `Result`s into a single `Result` of array. Returns the first `Err` found.

**Signature:** `<T, E>(results: Array<Result<T, E>>) => Result<T[], E>`

**Example:**
```typescript
combineAll([Ok(1), Ok(2), Ok(3)]); // Ok([1, 2, 3])
combineAll([Ok(1), Err('x'), Ok(3)]); // Err('x')
```

**See also:** `collectErrors`

---

#### `collectErrors(results)`

Collects all values if all are `Ok`, or all errors if any are `Err`. Unlike `combineAll`, does not short-circuit.

**Signature:** `<T, E>(results: Array<Result<T, E>>) => Result<T[], E[]>`

**Example:**
```typescript
collectErrors([Ok(1), Err('e1'), Ok(2), Err('e2')]);
// Err(['e1', 'e2'])

collectErrors([Ok(1), Ok(2)]);
// Ok([1, 2])
```

---

### Error Wrapping

---

#### `tryCatch(fn)(...args)`

Wraps a potentially-throwing function to return `Result` instead of throwing.

**Signature:** `<T extends unknown[], R, E = Error>(fn: (...args: T) => R) => (...args: T) => Result<R, E>`

**Example:**
```typescript
const safeParse = tryCatch(JSON.parse);
safeParse('{"a":1}'); // Ok({ a: 1 })
safeParse('bad');     // Err(SyntaxError)
```

---

#### `tryCatchAsync(fn)(...args)`

Async version of `tryCatch`. Wraps a Promise-returning function.

**Signature:** `<T extends unknown[], R, E = Error>(fn: (...args: T) => Promise<R>) => (...args: T) => Promise<Result<R, E>>`

**Example:**
```typescript
const safeUpload = tryCatchAsync(uploadFile);
const result = await safeUpload(blob); // Result<UploadResult, Error>
```

---

#### `fromPromise(promise)`

Converts a `Promise<T>` to a `Promise<Result<T, E>>`.

**Signature:** `<T, E = Error>(promise: Promise<T>) => Promise<Result<T, E>>`

**Example:**
```typescript
const result = await fromPromise(fetch('/api/users'));
// Ok(Response) | Err(Error)
```

---

### Async Result Transformations

---

#### `mapResultAsync(fn)(result)`

Async version of `mapResult`.

**Signature:** `<T, R, E>(fn: (value: T) => Promise<R>) => (result: Result<T, E>) => Promise<Result<R, E>>`

**Example:**
```typescript
await mapResultAsync(async (id: string) => fetchUser(id))(Ok('123'));
// Ok(user) or passes Err through
```

---

#### `flatMapAsync(fn)(result)`

Async version of `flatMap`.

**Signature:** `<T, R, E>(fn: (value: T) => Promise<Result<R, E>>) => (result: Result<T, E>) => Promise<Result<R, E>>`

**Example:**
```typescript
const fetchUser = async (id: string): Promise<Result<User, Error>> => ...;
await flatMapAsync(fetchUser)(Ok('user-123'));
```

---

### Validation

---

#### `validateAll(validators)(value)`

Runs all validators in sequence. Returns `Ok` if all pass, or the first `Err`.

**Signature:** `<T, E>(validators: Array<Validator<T, E>>) => (value: T) => Result<T, E>`

**Example:**
```typescript
const isPositive = (x: number) => x > 0 ? Ok(x) : Err('not positive');
const isEven = (x: number) => x % 2 === 0 ? Ok(x) : Err('not even');

validateAll([isPositive, isEven])(4);  // Ok(4)
validateAll([isPositive, isEven])(3);  // Err('not even')
validateAll([isPositive, isEven])(-2); // Err('not positive')
```

---

#### `validateAny(validators)(value)`

Returns `Ok` if at least one validator passes, or `Err` with all collected errors.

**Signature:** `<T, E>(validators: Array<Validator<T, E>>) => (value: T) => Result<T, E[]>`

**Example:**
```typescript
const isZero = (x: number) => x === 0 ? Ok(x) : Err('not zero');
const isPositive = (x: number) => x > 0 ? Ok(x) : Err('not positive');

validateAny([isZero, isPositive])(5);  // Ok(5)
validateAny([isZero, isPositive])(0);  // Ok(0)
validateAny([isZero, isPositive])(-1); // Err(['not zero', 'not positive'])
```

---

## Option\<T\>

`import { ... } from 'fp-core/option'`

Represents a value that may or may not be present. Use `Option` to eliminate `null`/`undefined` from your domain types.

```typescript
type Option<T> = { _tag: 'Some'; value: T } | { _tag: 'None' };
```

### Constructors

---

#### `Some(value)`

Wraps a present value.

**Signature:** `<T>(value: T) => Option<T>`

**Example:**
```typescript
Some(42);      // { _tag: 'Some', value: 42 }
Some('hello'); // { _tag: 'Some', value: 'hello' }
```

---

#### `None`

The absent value singleton.

**Example:**
```typescript
None; // { _tag: 'None' }
```

---

#### `fromNullable(value)`

Converts `null`/`undefined` to `None`; any other value to `Some`.

**Signature:** `<T>(value: T | null | undefined) => Option<T>`

**Example:**
```typescript
fromNullable(null);      // None
fromNullable(undefined); // None
fromNullable(0);         // Some(0)
fromNullable('');        // Some('')
```

---

#### `fromTryCatch(fn)`

Wraps a potentially-throwing function. Returns `None` on exception.

**Signature:** `<T>(fn: () => T) => Option<T>`

**Example:**
```typescript
fromTryCatch(() => JSON.parse('{"a":1}')); // Some({ a: 1 })
fromTryCatch(() => JSON.parse('bad'));     // None
```

---

### Type Guards

---

#### `isSome(option)`

Returns `true` and narrows to `Some<T>` if the option has a value.

**Signature:** `<T>(opt: Option<T>) => opt is Some<T>`

---

#### `isNone(option)`

Returns `true` and narrows to `None` if the option is absent.

**Signature:** `<T>(opt: Option<T>) => opt is None`

---

### Transformations

---

#### `mapOption(fn)(option)`

Applies `fn` to the inner value if `Some`; passes `None` through.

**Signature:** `<T, R>(fn: (value: T) => R) => (opt: Option<T>) => Option<R>`

**Example:**
```typescript
mapOption((x: number) => x * 2)(Some(5)); // Some(10)
mapOption((x: number) => x * 2)(None);    // None
```

---

#### `flatMapOption(fn)(option)` / `andThenOption`

Chains operations that may return `None`. Prevents `Some(Some(x))`.

**Signature:** `<T, R>(fn: (value: T) => Option<R>) => (opt: Option<T>) => Option<R>`

**Example:**
```typescript
const safeSqrt = (n: number): Option<number> =>
  n >= 0 ? Some(Math.sqrt(n)) : None;

flatMapOption(safeSqrt)(Some(16)); // Some(4)
flatMapOption(safeSqrt)(Some(-1)); // None
flatMapOption(safeSqrt)(None);     // None
```

---

#### `matchOption(onSome, onNone)(option)`

Pattern-matches over an `Option`.

**Signature:** `<T, R>(onSome: (value: T) => R, onNone: () => R) => (opt: Option<T>) => R`

**Example:**
```typescript
const greet = matchOption(
  (name: string) => `Hello, ${name}!`,
  () => 'Hello, stranger!',
);
greet(Some('Alice')); // 'Hello, Alice!'
greet(None);          // 'Hello, stranger!'
```

---

#### `unwrapOptionOr(defaultValue)(option)`

Extracts the value if `Some`, or returns `defaultValue` if `None`.

**Signature:** `<T>(defaultValue: T) => (opt: Option<T>) => T`

**Example:**
```typescript
unwrapOptionOr(0)(Some(42)); // 42
unwrapOptionOr(0)(None);     // 0
```

---

#### `unwrapOptionOrElse(fn)(option)`

Extracts the value or computes a fallback lazily.

**Signature:** `<T>(fn: () => T) => (opt: Option<T>) => T`

---

#### `unwrapOption(option)`

Extracts the value or throws. Prefer `unwrapOptionOr` in production.

**Signature:** `<T>(opt: Option<T>) => T`

---

#### `orElseOption(fallback)(option)`

Returns the option if `Some`, or calls `fallback()` to produce an alternative.

**Signature:** `<T>(fallback: () => Option<T>) => (opt: Option<T>) => Option<T>`

**Example:**
```typescript
const cached = orElseOption(() => fromNullable(db.get(key)));
cached(Some(value)); // Some(value) — cached hit, db not called
cached(None);        // tries db
```

---

#### `toNullable(option)`

Converts `Option<T>` to `T | null`.

**Signature:** `<T>(opt: Option<T>) => T | null`

**Example:**
```typescript
toNullable(Some(42)); // 42
toNullable(None);     // null
```

---

#### `toArray(option)`

Converts `Option<T>` to an array with zero or one element.

**Signature:** `<T>(opt: Option<T>) => T[]`

**Example:**
```typescript
toArray(Some(42)); // [42]
toArray(None);     // []
```

---

### Combinators

---

#### `zipOption(a, b)`

Combines two Options into a tuple. Returns `None` if either is `None`.

**Signature:** `<A, B>(a: Option<A>, b: Option<B>) => Option<[A, B]>`

**Example:**
```typescript
zipOption(Some(1), Some('a')); // Some([1, 'a'])
zipOption(None, Some('a'));    // None
```

---

#### `sequenceOption(options)`

Converts `Array<Option<T>>` to `Option<T[]>`. Returns `None` if any element is `None`.

**Signature:** `<T>(opts: Array<Option<T>>) => Option<T[]>`

**Example:**
```typescript
sequenceOption([Some(1), Some(2), Some(3)]); // Some([1, 2, 3])
sequenceOption([Some(1), None, Some(3)]);    // None
```

---

#### `compactOptions(options)`

Filters out `None` values and unwraps `Some` values.

**Signature:** `<T>(opts: Array<Option<T>>) => T[]`

**Example:**
```typescript
compactOptions([Some(1), None, Some(2), None]); // [1, 2]
```

---

### Interop with Result

---

#### `optionToResult(onNone)(option)`

Converts `Option<T>` to `Result<T, E>`, using `onNone` to produce the error.

**Signature:** `<T, E>(onNone: () => E) => (opt: Option<T>) => Result<T, E>`

**Example:**
```typescript
optionToResult(() => 'not found')(Some(42)); // Ok(42)
optionToResult(() => 'not found')(None);     // Err('not found')
```

---

#### `resultToOption(result)`

Converts `Result<T, E>` to `Option<T>`, discarding the error.

**Signature:** `<T, E>(result: Result<T, E>) => Option<T>`

**Example:**
```typescript
resultToOption(Ok(42));      // Some(42)
resultToOption(Err('oops')); // None
```

---

## Composition

`import { ... } from 'fp-core/composition'`

### `pipe(value, ...fns)`

Passes a value through a series of functions left-to-right. Every intermediate type is inferred — no type loss up to 10 steps.

**Signature:** `pipe<A, B, C, ...>(value: A, f1: (a: A) => B, f2: (b: B) => C, ...) => ...`

**Example:**
```typescript
pipe(
  '  hello world  ',
  s => s.trim(),       // string
  s => s.split(' '),   // string[]
  arr => arr.length,   // number
  n => n > 1,          // boolean
); // true
```

**See also:** `compose`, `flow`, `pipeAsync`

---

### `compose(...fns)`

Composes functions right-to-left into a single function (the rightmost is applied first).

**Signature:** `compose<A, B, C, ...>(fn_last: ..., ..., fn_first: (a: A) => B) => (a: A) => ...`

**Example:**
```typescript
const process = compose(
  (n: number) => `Result: ${n}`,          // applied last
  (arr: number[]) => arr.reduce((a, b) => a + b, 0), // applied second
  (s: string) => s.split(',').map(Number), // applied first
);
process('1,2,3,4,5'); // 'Result: 15'
```

---

### `identity(value)`

Returns its argument unchanged.

**Signature:** `<T>(value: T) => T`

**Example:**
```typescript
identity(42); // 42
[1, 2, 3].map(identity); // [1, 2, 3]
```

---

### `constant(value)(...args)`

Returns a function that always returns `value`, ignoring all arguments.

**Signature:** `<T>(value: T) => (...args: unknown[]) => T`

**Example:**
```typescript
const always42 = constant(42);
always42('anything', 'ignored'); // 42
```

---

### `tap(fn)(value)`

Executes a side-effect function with `value` and returns `value` unchanged. Useful for debugging inside a `pipe`.

**Signature:** `<T>(fn: (value: T) => void) => (value: T) => T`

**Example:**
```typescript
pipe(
  [1, 2, 3],
  map(x => x * 2),
  tap(console.log), // logs [2, 4, 6] — does not change the array
  filter(x => x > 2),
); // [4, 6]
```

---

### `curry(fn)(...args)`

Converts a multi-argument function into a chain of single-argument functions.

**Signature:** `<T extends unknown[], R>(fn: (...args: T) => R) => (...args: readonly unknown[]) => unknown`

**Example:**
```typescript
const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
```

---

### `partial(fn, ...partialArgs)(...remainingArgs)`

Pre-fills arguments of a function.

**Signature:** `<T extends unknown[], R>(fn: (...args: T) => R, ...partialArgs: unknown[]) => (...remainingArgs: unknown[]) => R`

**Example:**
```typescript
const add = (a: number, b: number, c: number) => a + b + c;
const add5 = partial(add, 5);
add5(3, 2); // 10
```

---

### `flip(fn)(b, a)`

Swaps the first two arguments of a binary function.

**Signature:** `<A, B, R>(fn: (a: A, b: B) => R) => (b: B, a: A) => R`

**Example:**
```typescript
const divide = (a: number, b: number) => a / b;
flip(divide)(2, 10); // 5  (same as divide(10, 2))
```

---

### `prop(key)(obj)`

Extracts a property from an object (curried).

**Signature:** `<T extends object, K extends keyof T>(key: K) => (obj: T) => T[K] | undefined`

**Example:**
```typescript
const getName = prop('name');
getName({ name: 'Alice', age: 30 }); // 'Alice'
```

---

### `memoize(fn, keyFn?)`

Caches function results. Uses `JSON.stringify(args)` as the cache key by default.

**Signature:** `<T extends unknown[], R>(fn: (...args: T) => R, keyFn?: (...args: T) => string) => (...args: T) => R`

**Example:**
```typescript
const expensiveCalc = memoize((n: number) => n * n);
expensiveCalc(5); // computed
expensiveCalc(5); // cached
```

**See also:** `memoizeAsync`

---

### `once(fn)`

Returns a function that executes `fn` at most once. Subsequent calls return the result of the first call.

**Signature:** `<T extends unknown[], R>(fn: (...args: T) => R) => (...args: T) => R`

**Example:**
```typescript
const init = once(() => { console.log('init'); return 42; });
init(); // logs 'init', returns 42
init(); // returns 42 (no log)
```

---

### `after(n, fn)`

Returns a function that only executes `fn` starting from the `n`th call.

**Signature:** `<T extends unknown[], R>(n: number, fn: (...args: T) => R) => (...args: T) => R | undefined`

**Example:**
```typescript
const log = after(3, () => console.log('reached'));
log(); // undefined
log(); // undefined
log(); // logs 'reached'
```

---

### `before(n, fn)`

Returns a function that executes `fn` only for the first `n - 1` calls.

**Signature:** `<T extends unknown[], R>(n: number, fn: (...args: T) => R) => (...args: T) => R | undefined`

**Example:**
```typescript
const log = before(3, () => console.log('ok'));
log(); // logs 'ok'
log(); // logs 'ok'
log(); // no-op
```

---

### `negate(predicate)(...args)`

Inverts a predicate function.

**Signature:** `<T extends unknown[]>(predicate: (...args: T) => boolean) => (...args: T) => boolean`

**Example:**
```typescript
const isEven = (x: number) => x % 2 === 0;
const isOdd = negate(isEven);
isOdd(3); // true
```

**See also:** `not` in the predicates module

---

## Async

`import { ... } from 'fp-core/async'`

### `pipeAsync(...fns)(value)`

Composes async functions left-to-right.

**Signature:** `pipeAsync<A, B, C, ...>(fn1: (a: A) => Promise<B>, fn2: (b: B) => Promise<C>, ...) => (a: A) => Promise<...>`

**Example:**
```typescript
const processUser = pipeAsync(
  fetchUser,       // (id: string) => Promise<User>
  enrichWithRoles, // (user: User) => Promise<UserWithRoles>
  formatForClient, // (user: UserWithRoles) => Promise<ClientUser>
);
await processUser('user-123');
```

---

### `composeAsync(...fns)(value)`

Composes async functions right-to-left. Does not mutate the input array.

**Signature:** Same overloads as `pipeAsync`, reversed.

**Example:**
```typescript
const process = composeAsync(formatUser, enrichUser, fetchUser);
await process('user-123');
// equivalent to: fetchUser → enrichUser → formatUser
```

---

### `mapAsync(fn)(array)`

Applies an async function to each element **sequentially**.

**Signature:** `<T, R>(fn: (item: T) => Promise<R>) => (arr: T[]) => Promise<R[]>`

**Example:**
```typescript
await mapAsync(async (id: string) => fetchUser(id))(['1', '2', '3']);
// users fetched one at a time
```

**See also:** `mapParallel`, `mapConcurrent`

---

### `mapParallel(fn)(array)`

Applies an async function to all elements in **parallel** (`Promise.all`).

**Signature:** `<T, R>(fn: (item: T) => Promise<R>) => (arr: T[]) => Promise<R[]>`

**Example:**
```typescript
await mapParallel(fetchUser)(['1', '2', '3']);
// all 3 fetches run simultaneously
```

---

### `mapConcurrent(concurrency, fn)(array)`

Applies an async function with a **concurrency limit**.

**Signature:** `<T, R>(concurrency: number, fn: (item: T) => Promise<R>) => (arr: T[]) => Promise<R[]>`

**Example:**
```typescript
await mapConcurrent(5, fetchUser)(ids); // at most 5 concurrent requests
```

---

### `filterAsync(predicate)(array)`

Filters an array using an async predicate, **sequentially**.

**Signature:** `<T>(predicate: (item: T) => Promise<boolean>) => (arr: T[]) => Promise<T[]>`

**Example:**
```typescript
const isActive = async (user: User) => (await fetchStatus(user.id)) === 'active';
await filterAsync(isActive)(users);
```

---

### `reduceAsync(fn, initial)(array)`

Reduces an array with an async reducer, **sequentially**.

**Signature:** `<T, R>(fn: (acc: R, item: T) => Promise<R>, initial: R) => (arr: T[]) => Promise<R>`

**Example:**
```typescript
const sumBalances = async (acc: number, user: User) =>
  acc + await fetchBalance(user.id);
await reduceAsync(sumBalances, 0)(users);
```

---

### `retry(maxAttempts, delayMs?, backoff?)(fn)`

Retries an async function with exponential backoff. Returns `Result<T, Error>` — never throws.

**Signature:** `<T>(maxAttempts: number, delayMs?: number, backoff?: number) => (fn: () => Promise<T>) => Promise<Result<T, Error>>`

**Example:**
```typescript
const result = await retry(3, 1000)(fetchUnstableApi);
// tries up to 3 times with 1s, 2s, 4s delays
if (!result.ok) console.error(result.error.message);
```

---

### `timeout(ms)(promise)`

Rejects a promise if it does not resolve within `ms` milliseconds.

**Signature:** `<T>(ms: number) => (promise: Promise<T>) => Promise<T>`

**Example:**
```typescript
await timeout(5000)(fetch('/slow-endpoint'));
// throws Error('Timeout after 5000ms') if too slow
```

---

### `sleep(ms)`

Returns a promise that resolves after `ms` milliseconds.

**Signature:** `(ms: number) => Promise<void>`

**Example:**
```typescript
await sleep(1000); // pauses for 1 second
```

---

### `debounceAsync(delayMs)(fn)`

Returns a debounced version of an async function. Only the last call within the delay window executes.

**Signature:** `<T extends unknown[], R>(delayMs: number) => (fn: (...args: T) => Promise<R>) => (...args: T) => Promise<R>`

**Example:**
```typescript
const save = debounceAsync(500)(async (data: string) => api.save(data));
save('a'); // cancelled
save('b'); // cancelled
save('c'); // executes after 500ms
```

---

### `throttleAsync(delayMs)(fn)`

Returns a throttled version of an async function. At most one execution per delay window; calls within the window return the pending promise.

**Signature:** `<T extends unknown[], R>(delayMs: number) => (fn: (...args: T) => Promise<R>) => (...args: T) => Promise<R>`

**Example:**
```typescript
const logEvent = throttleAsync(1000)(async (e: string) => api.log(e));
logEvent('click'); // executes
logEvent('click'); // returns same promise
```

---

### `memoizeAsync(fn, keyFn?)`

Memoizes an async function. Returns `Result<T, Error>` on each call — never rethrows.

**Signature:** `<T extends unknown[], R>(fn: (...args: T) => Promise<R>, keyFn?: (...args: T) => string) => (...args: T) => Promise<Result<R, Error>>`

**Example:**
```typescript
const fetchUser = memoizeAsync(async (id: string) => api.getUser(id));
await fetchUser('123'); // Ok(user) — network call
await fetchUser('123'); // Ok(user) — from cache
```

---

### `sequence(fns)`

Runs an array of async thunks **sequentially**, collecting results.

**Signature:** `<T>(fns: Array<() => Promise<T>>) => Promise<T[]>`

**Example:**
```typescript
await sequence([
  async () => step1(),
  async () => step2(),
]); // ['result1', 'result2'] — in order
```

---

### `parallel(fns)`

Runs an array of async thunks **in parallel**, collecting results.

**Signature:** `<T>(fns: Array<() => Promise<T>>) => Promise<T[]>`

**Example:**
```typescript
await parallel([
  async () => fetchUser('1'),
  async () => fetchUser('2'),
]);
```

---

## Array

`import { ... } from 'fp-core/array'`

All array functions are curried and data-last — designed to compose inside `pipe`.

### Transformations

| Function | Signature | Description |
|----------|-----------|-------------|
| `map(fn)(arr)` | `<T, R>(fn: (item: T) => R) => (arr: T[]) => R[]` | Applies `fn` to every element |
| `filter(pred)(arr)` | `<T>(pred: (item: T) => boolean) => (arr: T[]) => T[]` | Keeps elements satisfying `pred` |
| `reduce(fn, init)(arr)` | `<T, R>(fn: (acc: R, item: T) => R, init: R) => (arr: T[]) => R` | Folds array to single value |
| `flatMapArray(fn)(arr)` | `<T, R>(fn: (item: T) => R[]) => (arr: T[]) => R[]` | Maps and flattens one level |
| `sortBy(fn)(arr)` | `<T>(fn: (item: T) => string \| number) => (arr: T[]) => T[]` | Sorts by key, no mutation |
| `take(n)(arr)` | `(n: number) => <T>(arr: T[]) => T[]` | First `n` elements |
| `skip(n)(arr)` | `(n: number) => <T>(arr: T[]) => T[]` | Drop first `n` elements |
| `chunk(size)(arr)` | `(size: number) => <T>(arr: T[]) => T[][]` | Splits into chunks |
| `compact(arr)` | `<T>(arr: Array<T \| null \| undefined \| false \| 0 \| ''>) => T[]` | Removes falsy values |

### Search & Grouping

| Function | Description |
|----------|-------------|
| `find(pred)(arr)` | First element matching `pred`, or `undefined` |
| `some(pred)(arr)` | `true` if any element matches |
| `every(pred)(arr)` | `true` if all elements match |
| `groupBy(fn)(arr)` | Groups elements by key function into a record |
| `countBy(fn)(arr)` | Counts elements per key |
| `partition(pred)(arr)` | Splits into `[matches, non-matches]` |

### Set Operations & Reshaping

| Function | Description |
|----------|-------------|
| `unique(arr)` | Removes duplicates, preserves insertion order |
| `flatten(arr)` | Flattens one level: `T[][] → T[]` |
| `flattenDeep(arr)` | Recursively flattens all levels |
| `zip(arr1, arr2)` | Pairs elements into tuples, truncates to shorter length |
| `unzip(arr)` | Splits `[T, U][]` into `[T[], U[]]` |
| `hasItems(arr)` | `true` if array is non-empty |

**Example:**
```typescript
pipe(
  [1, 2, 3, 4, 5, 6],
  filter(n => n % 2 === 0),       // [2, 4, 6]
  map(n => n * 10),                // [20, 40, 60]
  reduce((acc, n) => acc + n, 0),  // 120
);

groupBy((u: User) => u.role)(users);
// { admin: [User, ...], viewer: [User, ...] }

const [evens, odds] = partition(n => n % 2 === 0)([1, 2, 3, 4]);
```

---

## Object

`import { ... } from 'fp-core/object'`

### Picking & Merging

| Function | Description |
|----------|-------------|
| `pick(keys)(obj)` | Returns a new object with only the specified keys |
| `omit(keys)(obj)` | Returns a new object with the specified keys removed |
| `merge(base)(override)` | Shallow merge; `override` takes precedence |
| `deepMerge(base)(override)` | Recursive merge; arrays are replaced, not merged |

**Example:**
```typescript
const user = { id: 1, name: 'Alice', password: 'secret' };
pick(['id', 'name'])(user);   // { id: 1, name: 'Alice' }
omit(['password'])(user);      // { id: 1, name: 'Alice' }
```

### Mapping & Filtering

| Function | Description |
|----------|-------------|
| `mapValues(fn)(obj)` | Transforms every value, preserving keys |
| `mapKeys(fn)(obj)` | Transforms every key, preserving values |
| `filterValues(pred)(obj)` | Keeps entries whose value satisfies `pred` |
| `filterKeys(pred)(obj)` | Keeps entries whose key satisfies `pred` |

**Example:**
```typescript
mapValues((v: number) => v * 2)({ a: 1, b: 2 }); // { a: 2, b: 4 }
filterValues((v: unknown) => v != null)({ a: 1, b: null }); // { a: 1 }
```

### Access & Query

| Function | Description |
|----------|-------------|
| `keys(obj)` | Typed `Object.keys` |
| `values(obj)` | Typed `Object.values` |
| `entries(obj)` | Typed `Object.entries` |
| `fromEntries(pairs)` | Typed `Object.fromEntries` |
| `hasKey(key)(obj)` | `true` if `key` exists in `obj` |
| `isEmpty(obj)` | `true` if object has no own enumerable properties |
| `isObject(value)` | Type guard: plain object, not array, not null |

### Nested Path Operations

| Function | Description |
|----------|-------------|
| `getPath(path)(obj)` | Reads a nested value by path; returns `undefined` if any segment is missing |
| `setPath(path, value)(obj)` | Returns a new object with the nested value replaced; does not mutate |
| `updatePath(path, fn)(obj)` | Applies `fn` to the nested value and returns a new object |

**Example:**
```typescript
const config = { db: { host: 'localhost', port: 5432 } };
setPath(['db', 'port'], 5433)(config);
// { db: { host: 'localhost', port: 5433 } }

getPath(['db', 'port'])(config); // 5432
```

### Immutability & Equality

| Function | Description |
|----------|-------------|
| `clone(obj)` | Deep clone of plain objects, arrays, and Dates |
| `freeze(obj)` | Recursively `Object.freeze`s the object |
| `equals(obj1)(obj2)` | Deep structural equality comparison |

---

## String

`import { ... } from 'fp-core/string'`

### Case Conversion

| Function | Example |
|----------|---------|
| `toUpperCase(str)` | `'hello' → 'HELLO'` |
| `toLowerCase(str)` | `'HELLO' → 'hello'` |
| `capitalize(str)` | `'hello world' → 'Hello world'` |
| `camelCase(str)` | `'hello world' → 'helloWorld'` |
| `pascalCase(str)` | `'hello world' → 'HelloWorld'` |
| `snakeCase(str)` | `'helloWorld' → 'hello_world'` |
| `kebabCase(str)` | `'helloWorld' → 'hello-world'` |
| `titleCase(str)` | `'hello world' → 'Hello World'` |

### Whitespace

| Function | Description |
|----------|-------------|
| `trim(str)` | Removes leading and trailing whitespace |
| `trimStart(str)` | Removes leading whitespace |
| `trimEnd(str)` | Removes trailing whitespace |
| `dedent(str)` | Removes common leading whitespace from all lines |
| `indent(spaces, char?)(str)` | Adds indentation to every line |

### Splitting & Joining

| Function | Description |
|----------|-------------|
| `split(separator)(str)` | Curried `String.prototype.split` |
| `join(separator)(arr)` | Curried `Array.prototype.join` |
| `words(str)` | Extracts all words: `'hello world' → ['hello', 'world']` |
| `lines(str)` | Splits by newline |

### Search & Test

| Function | Description |
|----------|-------------|
| `startsWith(search)(str)` | Curried `startsWith` |
| `endsWith(search)(str)` | Curried `endsWith` |
| `includes(search)(str)` | Curried `includes` |
| `matches(regex)(str)` | Tests a regex against `str` |
| `isEmptyString(str)` | `true` if length is zero |
| `isBlank(str)` | `true` if empty or only whitespace |
| `length(str)` | Returns `str.length` |

### Manipulation

| Function | Description |
|----------|-------------|
| `replace(search, replacement)(str)` | Replaces first match |
| `replaceAll(search, replacement)(str)` | Replaces all matches |
| `slice(start, end?)(str)` | Curried `slice` |
| `substring(start, end?)(str)` | Curried `substring` |
| `padStart(length, fill?)(str)` | Pads to length from the start |
| `padEnd(length, fill?)(str)` | Pads to length from the end |
| `repeat(count)(str)` | Repeats the string `count` times |
| `reverse(str)` | Reverses character order |
| `truncate(maxLength, suffix?)(str)` | Cuts at `maxLength`, appends suffix |

### Interpolation

#### `template(values)(str)`

Replaces `{{key}}` placeholders using a values object.

**Example:**
```typescript
template({ name: 'Alice', role: 'admin' })('{{name}} is {{role}}');
// 'Alice is admin'
```

#### `format(template)(...values)`

Printf-style formatting with `%s` (string) and `%d` (number) placeholders.

**Example:**
```typescript
format('Hello %s, you are %d years old')('Alice', 30);
// 'Hello Alice, you are 30 years old'
```

### Validation

| Function | Description |
|----------|-------------|
| `isEmail(str)` | Basic email format check |
| `isUrl(str)` | URL validity via `new URL()` |
| `isNumeric(str)` | `true` if string represents a finite number |
| `isAlpha(str)` | Only alphabetic characters |
| `isAlphanumeric(str)` | Only alphanumeric characters |
| `isHexColor(str)` | `#RRGGBB` or `#RGB` format |
| `isUUID(str)` | UUID v1–v5 format |

---

## Predicates

`import { ... } from 'fp-core/predicates'`

### Logical Combinators

| Function | Description |
|----------|-------------|
| `not(pred)(value)` | Inverts a predicate |
| `and(...preds)(value)` | `true` if ALL predicates pass |
| `or(...preds)(value)` | `true` if ANY predicate passes |
| `xor(...preds)(value)` | `true` if EXACTLY ONE predicate passes |
| `nand(...preds)(value)` | `true` if NOT ALL predicates pass |
| `nor(...preds)(value)` | `true` if NO predicate passes |

**Example:**
```typescript
const isValidAge = and(isNumber, between(0, 150));
isValidAge(25);   // true
isValidAge(-1);   // false
isValidAge('x');  // false

const isAdminOrOwner = or(isAdmin, isOwner);
```

### Comparison

| Function | Description |
|----------|-------------|
| `gt(threshold)(value)` | `value > threshold` |
| `gte(threshold)(value)` | `value >= threshold` |
| `lt(threshold)(value)` | `value < threshold` |
| `lte(threshold)(value)` | `value <= threshold` |
| `eq(target)(value)` | `value === target` |
| `neq(target)(value)` | `value !== target` |
| `between(min, max)(value)` | `min <= value <= max` |

### Type Guards

| Function | Narrows to |
|----------|-----------|
| `isString(value)` | `string` |
| `isNumber(value)` | `number` |
| `isBoolean(value)` | `boolean` |
| `isFunction(value)` | `(...args: unknown[]) => unknown` |
| `isArray(value)` | `unknown[]` |
| `isNull(value)` | `null` |
| `isUndefined(value)` | `undefined` |
| `isNil(value)` | `null \| undefined` |
| `isDate(value)` | `Date` (also validates — `isNaN` dates return `false`) |
| `isRegExp(value)` | `RegExp` |
| `isPromise(value)` | `Promise<unknown>` |

### Structural Guards

| Function | Description |
|----------|-------------|
| `isNotNull(value)` | Type guard: narrows `T \| null \| undefined` to `T` |
| `isNotEmpty(str)` | `true` if string is non-empty after trimming |
| `hasProperty(key)(obj)` | `true` if `key` exists and its value is not null/undefined |

### Numeric Predicates

| Function | Description |
|----------|-------------|
| `isEven(n)` | `n % 2 === 0` |
| `isOdd(n)` | `n % 2 !== 0` |
| `isPositive(n)` | `n > 0` |
| `isNegative(n)` | `n < 0` |
| `isZero(n)` | `n === 0` |
| `isInteger(n)` | `Number.isInteger(n)` |
| `isNaN(n)` | `Number.isNaN(n)` |
| `isFinite(n)` | `Number.isFinite(n)` |
| `isInfinite(n)` | `!isFinite(n) && !isNaN(n)` |
