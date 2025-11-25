import { isAlgorithm } from './isAlgorithm';
import { Algorithm } from './types';

/**
 * Converts a value to a valid COSE algorithm.
 *
 * @param algorithm - The value to convert to a COSE algorithm
 * @returns The validated COSE algorithm
 * @throws {Error} When the provided value is not a valid COSE algorithm
 *
 * @example
 * ```typescript
 * const algorithm = toAlgorithm(Algorithm.ES256); // Returns Algorithm.ES256
 * const eddsaAlg = toAlgorithm(-8); // Returns Algorithm.EdDSA
 *
 * // Throws error for invalid algorithms
 * toAlgorithm(999); // Throws: Unsupported COSE algorithm: 999
 * toAlgorithm('ES256'); // Throws: Unsupported COSE algorithm: ES256
 * ```
 */
export const toAlgorithm = (algorithm: unknown): Algorithm => {
  if (isAlgorithm(algorithm)) {
    return algorithm;
  }

  throw new Error(`Unsupported COSE algorithm: ${algorithm}`);
};
