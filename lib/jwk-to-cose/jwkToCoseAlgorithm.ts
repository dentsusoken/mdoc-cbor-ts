import { Algorithm } from '@/cose/types';
import { JwkAlgorithm } from '@/jwk/types';

const JWK_TO_COSE_ALGORITHM: Record<string, number> = {
  [JwkAlgorithm.EdDSA]: Algorithm.EdDSA,
  [JwkAlgorithm.ES256]: Algorithm.ES256,
  [JwkAlgorithm.ES384]: Algorithm.ES384,
  [JwkAlgorithm.ES512]: Algorithm.ES512,
};

/**
 * Converts a JWK algorithm to the corresponding COSE algorithm.
 *
 * @param jwkAlgorithm - The JWK algorithm string to convert
 * @returns The corresponding COSE algorithm identifier
 * @throws {Error} When the provided jwkAlgorithm is not a valid JWK algorithm or is not a string
 *
 * @example
 * ```typescript
 * const coseAlg = jwkToCoseAlgorithm('ES256'); // Returns Algorithm.ES256 (-7)
 * const edAlg = jwkToCoseAlgorithm('EdDSA'); // Returns Algorithm.EdDSA (-8)
 *
 * // Throws error for invalid algorithms
 * jwkToCoseAlgorithm('invalid-algorithm'); // Throws: Unsupported JWK algorithm: invalid-algorithm
 * jwkToCoseAlgorithm(null); // Throws: Unsupported JWK algorithm: null
 * ```
 */
export const jwkToCoseAlgorithm = (jwkAlgorithm: unknown): number => {
  if (typeof jwkAlgorithm !== 'string') {
    throw new Error(`Unsupported JWK algorithm: ${jwkAlgorithm}`);
  }

  const coseAlgorithm = JWK_TO_COSE_ALGORITHM[jwkAlgorithm];

  if (coseAlgorithm == null) {
    throw new Error(`Unsupported JWK algorithm: ${jwkAlgorithm}`);
  }

  return coseAlgorithm;
};
