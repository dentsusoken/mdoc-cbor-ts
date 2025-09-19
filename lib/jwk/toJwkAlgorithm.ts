import { isJwkAlgorithm } from './isJwkAlgorithm';
import { JwkAlgorithms } from './types';

/**
 * Converts a string to a valid JWK algorithm.
 *
 * @param algorithm - The string to convert to a JWK algorithm
 * @returns The validated JWK algorithm
 * @throws {Error} When the provided algorithm is not a valid JWK algorithm
 *
 * @example
 * ```typescript
 * const algorithm = toJwkAlgorithm('ES256'); // Returns JwkAlgorithms.ES256
 * const eddsaAlg = toJwkAlgorithm('EdDSA'); // Returns JwkAlgorithms.EdDSA
 *
 * // Throws error for invalid algorithms
 * toJwkAlgorithm('invalid-algorithm'); // Throws: Unsupported JWK algorithm: invalid-algorithm
 * ```
 */
export const toJwkAlgorithm = (algorithm: string): JwkAlgorithms => {
  if (isJwkAlgorithm(algorithm)) {
    return algorithm;
  }

  throw new Error(`Unsupported JWK algorithm: ${algorithm}`);
};
