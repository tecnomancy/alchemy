# Contributing to fp-core

## Getting started

```bash
git clone https://github.com/roxdavirox/fp-core.git
cd fp-core
npm install
npm test
```

All tests must pass before you start. If they don't, open an issue.

---

## Branch naming

```
<type>/issue-<N>-<slug>
```

Examples: `fix/issue-1-unique-flatten-thunk`, `feat/issue-5-subpath-exports`

Use the helper script to create a branch from an existing issue:

```bash
./scripts/branch-create.sh <issue-number>
```

Never commit directly to `main`.

---

## Commit convention

```
type(scope): description in English
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `ci`, `chore`

**Scopes:** `result`, `option`, `array`, `object`, `string`, `predicates`, `async`, `composition`, `ci`, `dx`

Commits must be atomic. Commit after each complete logical change — do not accumulate unrelated changes.

---

## Opening PRs

1. Open an issue before a PR for any new feature or non-trivial change.
2. Work on a `<type>/issue-<N>-<slug>` branch.
3. Use the helper script to open the PR:

```bash
./scripts/pr-create.sh
```

4. Use `./scripts/pr-check.sh <N>` to inspect CI and review status.

---

## Test requirements

- Every new exported function needs tests in `tests/<module>.test.ts`.
- Coverage thresholds are enforced: **90% lines/functions/statements, 85% branches**.
- Run the full suite before pushing:

```bash
npm run test:coverage
```

Tests use [Vitest](https://vitest.dev/). Follow the style of existing test files.

---

## JSDoc requirement

Every exported function must have a JSDoc block with at least one `@example`:

```typescript
/**
 * Returns the first element of an array, or `None` if empty.
 *
 * @example
 * head([1, 2, 3]) // Some(1)
 * head([])        // None
 */
export const head = ...
```

---

## Code style

- **No `any`.** Use `unknown` + type guard when necessary.
- **No mutation.** Spread, `map`, `filter`, `reduce` only.
- **Data-last currying.** The data argument comes last so functions compose naturally in `pipe`.
- **Early returns over `if/else`.** Prefer ternary or early return where it's clearer.
- **No runtime dependencies.** fp-core has zero dependencies and must stay that way.

---

## CI

All checks must pass before a PR can be merged:

```bash
npm run type-check   # TypeScript — zero errors
npm run lint         # ESLint — zero warnings
npm test             # Vitest — all tests pass
npm run build        # tsc — compiles cleanly
```

CI runs automatically on every push and PR via GitHub Actions.
