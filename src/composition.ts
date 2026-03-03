/**
 * Functional composition utilities.
 *
 * Strongly-typed pipe/compose/flow with per-step type inference up to 10 steps.
 * Unlike Ramda, every intermediate type is inferred — no `any` leakage.
 *
 * @module composition
 */

export { pipe } from './_internal/pipe.js';
export { compose, flow } from './_internal/compose.js';
export {
  identity,
  constant,
  prop,
  curry,
  partial,
  flip,
  tap,
  memoize,
  once,
  after,
  before,
  negate,
} from './_internal/fn-utils.js';
