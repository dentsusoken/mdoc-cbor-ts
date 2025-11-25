import { Algorithm } from './types';

/**
 * Checks if a given value is a valid COSE algorithm.
 *
 * @param algorithm - The value to check
 * @returns True if the value is a valid COSE algorithm, false otherwise
 *
 * @example
 * ```typescript
 * isAlgorithm(Algorithm.ES256); // Returns true
 * isAlgorithm(-7); // Returns true (ES256)
 * isAlgorithm('ES256'); // Returns false (not a number)
 * isAlgorithm(999); // Returns false (not a valid algorithm)
 * ```
 */
export const isAlgorithm = (algorithm: unknown): algorithm is Algorithm => {
  if (typeof algorithm !== 'number') {
    return false;
  }

  return Object.values(Algorithm).includes(algorithm);
};
