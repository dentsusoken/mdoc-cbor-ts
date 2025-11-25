import { isJwkAlgorithm } from './isJwkAlgorithm';
import { JwkAlgorithm } from './types';

/**
 * Converts a value to a valid JWK algorithm.
 *
 * @param algorithm - The value to convert to a JWK algorithm
 * @returns The validated JWK algorithm
 * @throws {Error} When the provided value is not a valid JWK algorithm
 *
 * @example
 * ```typescript
 * const algorithm = toJwkAlgorithm(JwkAlgorithm.ES256); // Returns JwkAlgorithm.ES256
 * const eddsaAlg = toJwkAlgorithm('EdDSA'); // Returns JwkAlgorithm.EdDSA
 *
 * // Throws error for invalid algorithms
 * toJwkAlgorithm(999); // Throws: Unsupported JWK algorithm: 999
 * toJwkAlgorithm('InvalidAlg'); // Throws: Unsupported JWK algorithm: InvalidAlg
 * ```
 */
export const toJwkAlgorithm = (algorithm: unknown): JwkAlgorithm => {
  if (isJwkAlgorithm(algorithm)) {
    return algorithm;
  }

  throw new Error(`Unsupported JWK algorithm: ${algorithm}`);
};
