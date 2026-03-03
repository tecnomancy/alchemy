/**
 * Functional object manipulation utilities.
 * @module object
 */

export { isObject } from './_internal/object-utils.js';

export {
  pick,
  omit,
  merge,
  deepMerge,
  mapValues,
  mapKeys,
  filterKeys,
  filterValues,
} from './_internal/object-transform.js';

export {
  keys,
  values,
  entries,
  fromEntries,
  hasKey,
  getPath,
  setPath,
  updatePath,
  isEmpty,
  equals,
  clone,
  freeze,
} from './_internal/object-access.js';
