/**
 * Interop utilities between Option<T> and Result<T, E>.
 * Extracted here to break the circular dependency between result.ts and option.ts.
 * @module interop
 */

import type { Option } from './option.js';
import { Some, None, isSome } from './option.js';
import type { Result } from './result.js';
import { Ok, Err, isOk } from './result.js';

/**
 * Convert a Result to an Option, discarding the error on Err.
 *
 * @example
 * toOption(Ok(42));      // Some(42)
 * toOption(Err('oops')); // None
 */
export const toOption = <T, E>(result: Result<T, E>): Option<T> =>
  isOk(result) ? Some(result.value) : None;

/**
 * Converts Result<T, E> to Option<T>, discarding the error.
 * Alias for {@link toOption}.
 *
 * @example
 * resultToOption(Ok(42))      // Some(42)
 * resultToOption(Err('oops')) // None
 */
export const resultToOption = toOption;

/**
 * Converts Option<T> to Result<T, E>.
 *
 * @example
 * optionToResult(() => 'not found')(Some(42))  // Ok(42)
 * optionToResult(() => 'not found')(None)       // Err('not found')
 */
export const optionToResult =
  <T, E>(onNone: () => E) =>
  (opt: Option<T>): Result<T, E> =>
    isSome(opt) ? Ok(opt.value) : Err(onNone());
