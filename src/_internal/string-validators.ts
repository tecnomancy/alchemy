/**
 * String validation helpers: isEmail, isUrl, isNumeric, isAlpha, isAlphanumeric, isHexColor, isUUID.
 * @internal
 */

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Returns true if the string is a valid email address.
 *
 * @example
 * isEmail('user@example.com'); // true
 */
export const isEmail = (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

/**
 * Returns true if the string is a valid URL.
 *
 * @example
 * isUrl('https://example.com'); // true
 */
export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Returns true if the string represents a finite number.
 *
 * @example
 * isNumeric('123');   // true
 * isNumeric('12.34'); // true
 * isNumeric('abc');   // false
 */
export const isNumeric = (str: string): boolean =>
  !isNaN(Number(str)) && !isNaN(parseFloat(str));

/**
 * Returns true if the string contains only alphabetic characters.
 *
 * @example
 * isAlpha('hello');    // true
 * isAlpha('hello123'); // false
 */
export const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);

/**
 * Returns true if the string contains only alphanumeric characters.
 *
 * @example
 * isAlphanumeric('hello123'); // true
 */
export const isAlphanumeric = (str: string): boolean => /^[a-zA-Z0-9]+$/.test(str);

/**
 * Returns true if the string is a valid hexadecimal colour code.
 *
 * @example
 * isHexColor('#FF0000'); // true
 * isHexColor('#F00');    // true
 */
export const isHexColor = (str: string): boolean =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);

/**
 * Returns true if the string is a valid UUID (v1–v5).
 *
 * @example
 * isUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 */
export const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
