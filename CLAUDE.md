# fp-core

Functional programming primitives for TypeScript. Zero dependencies. Every type inferred.

## Repository

- **npm:** https://www.npmjs.com/package/fp-core
- **GitHub:** https://github.com/roxdavirox/fp-core

## Structure

```
fp-core/
├── src/
│   ├── index.ts        # barrel export
│   ├── result.ts       # Result<T, E>
│   ├── option.ts       # Option<T>
│   ├── composition.ts  # pipe, compose, curry, memoize, tap...
│   ├── async.ts        # pipeAsync, retry, timeout, debounce...
│   ├── array.ts        # map, filter, groupBy, chunk...
│   ├── object.ts       # pick, omit, merge, setPath...
│   ├── string.ts       # camelCase, truncate, template...
│   └── predicates.ts   # and, or, not, isString, between...
├── tests/
├── scripts/
│   ├── branch-create.sh
│   ├── pr-create.sh
│   └── pr-check.sh
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
```

## Commands

```bash
npm test              # run tests
npm run type-check    # type check
npm run build         # compile to dist/
npm run test:coverage # coverage report
```

## Design Principles

- **Value-first pipe:** `pipe(value, fn1, fn2)` — TypeScript infers every step
- **Curried data-last:** data argument comes last so functions compose in `pipe`
- **Result over exceptions:** functions that can fail return `Result<T, E>`
- **Option over null:** functions that can return nothing return `Option<T>`
- **Zero dependencies:** no runtime dependencies, ever
- **Tree-shakeable:** named exports, no side effects

## Conventions

### Commits

```
type(scope): description
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `ci`, `chore`
Scopes: `result`, `option`, `array`, `object`, `string`, `predicates`, `async`, `composition`, `ci`, `dx`

Commits must be atomic. Commit after each complete logical change — do not accumulate.

### Branches

```
<type>/issue-<N>-<slug>
```

Examples: `fix/issue-1-unique-flatten-thunk`, `feat/issue-5-subpath-exports`

Use `./scripts/branch-create.sh <N>` to create from an issue.

### Code style

- No `any`. Use `unknown` + type guard when necessary.
- No mutation. Spread, `map`, `filter`, `reduce` only.
- No `if/else` blocks where ternary or early return is clearer.
- JSDoc on every exported function with `@example`.

## Workflow

```
Issue -> ./scripts/branch-create.sh <N>
      -> code + commits
      -> ./scripts/pr-create.sh
      -> CI passes
      -> owner merges
```

## Blocked Actions (Agent Rules)

The agent must NOT perform these actions without explicit confirmation:

| Action       | Command              | Requires                         |
|--------------|----------------------|----------------------------------|
| Push         | `git push`           | "push" or "push to remote"       |
| Merge PR     | `gh pr merge`        | "merge the PR" or "merge #N"     |
| Force push   | `git push --force`   | Never — owner does this manually |
| Delete branch| `git branch -D`      | "delete the branch"              |

"ok" or "looks good" is not confirmation for push or merge.

## CI

- **ci.yml** — runs on PRs to `main`: type-check, test, build
- **pr-sync.yml** — inherits labels and milestone from linked issue
- **publish.yml** — publishes to npm on GitHub release

## Project Board

All issues and PRs are tracked in the mago-office project:
https://github.com/users/roxdavirox/projects/2
