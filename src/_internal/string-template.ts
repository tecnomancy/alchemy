/**
 * String template and interpolation helpers: template, format.
 * @internal
 */

// ============================================================================
// TEMPLATE & INTERPOLATION
// ============================================================================

/**
 * Interpolates `{{key}}` placeholders using a values object (curried, data-last).
 *
 * @example
 * template({ name: 'Alice', age: 30 })('Hello {{name}}, you are {{age}}');
 * // 'Hello Alice, you are 30'
 */
export const template =
  (values: Record<string, unknown>) =>
  (str: string): string =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`));

/**
 * Formats a string using printf-style `%s` and `%d` placeholders (curried, data-last).
 *
 * @example
 * format('Hello %s, you are %d years old')('Alice', 30);
 * // 'Hello Alice, you are 30 years old'
 */
export const format =
  (tmpl: string) =>
  (...values: unknown[]): string => {
    let index = 0;
    return tmpl.replace(/%[sd]/g, match => {
      const value = values[index++];
      if (match === '%s') return String(value);
      if (match === '%d') return String(Number(value));
      return match;
    });
  };
