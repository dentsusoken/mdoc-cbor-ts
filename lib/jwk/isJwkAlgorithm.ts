import { JwkAlgorithm } from './types';

/**
 * Checks if a given string is a valid JWK algorithm.
 *
 * @param algorithm - The string to check
 * @returns True if the algorithm is a valid JwkAlgorithms value, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isJwkAlgorithm('ES256'); // true
 * const isInvalid = isJwkAlgorithm('invalid-algorithm'); // false
 *
 * // Use with type narrowing
 * if (isJwkAlgorithm(someAlgorithm)) {
 *   // someAlgorithm is now typed as JwkAlgorithms
 *   console.log(`Valid algorithm: ${someAlgorithm}`);
 * }
 * ```
 */
export const isJwkAlgorithm = (
  algorithm: unknown
): algorithm is JwkAlgorithm => {
  if (typeof algorithm !== 'string') {
    return false;
  }

  return Object.values(JwkAlgorithm).includes(algorithm as JwkAlgorithm);
};
