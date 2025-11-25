import { JwkCurve } from './types';

/**
 * Checks if a given string is a valid JWK curve.
 *
 * @param curve - The string to check
 * @returns True if the curve is a valid JwkCurve value, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isJwkCurve('P-256'); // true
 * const isInvalid = isJwkCurve('invalid-curve'); // false
 *
 * // Use with type narrowing
 * if (isJwkCurve(someCurve)) {
 *   // someCurve is now typed as JwkCurve
 *   console.log(`Valid curve: ${someCurve}`);
 * }
 * ```
 */
export const isJwkCurve = (curve: unknown): curve is JwkCurve => {
  if (typeof curve !== 'string') {
    return false;
  }

  return Object.values(JwkCurve).includes(curve as JwkCurve);
};
