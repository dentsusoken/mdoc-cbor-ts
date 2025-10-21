import { JwkCurve } from './types';

/**
 * Checks if a given string is a valid JWK curve name.
 *
 * @param curve - The string to check
 * @returns True if the curve is a valid JwkCurves value, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isJwkCurve('P-256'); // true
 * const isInvalid = isJwkCurve('invalid-curve'); // false
 *
 * // Use with type narrowing
 * if (isJwkCurve(someCurve)) {
 *   // someCurve is now typed as JwkCurves
 *   console.log(`Valid curve: ${someCurve}`);
 * }
 * ```
 */
export const isJwkCurve = (curve: string): curve is JwkCurve => {
  return Object.values(JwkCurve).includes(curve as JwkCurve);
};
