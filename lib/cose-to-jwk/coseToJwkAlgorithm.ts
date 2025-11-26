import { Algorithm } from '@/cose/types';
import { JwkAlgorithm } from '@/jwk/types';

const COSE_TO_JWK_ALGORITHM: Record<number, string> = {
  [Algorithm.EdDSA]: JwkAlgorithm.EdDSA,
  [Algorithm.ES256]: JwkAlgorithm.ES256,
  [Algorithm.ES384]: JwkAlgorithm.ES384,
  [Algorithm.ES512]: JwkAlgorithm.ES512,
};

/**
 * Converts a COSE algorithm to the corresponding JWK algorithm.
 *
 * @param coseAlgorithm - The COSE algorithm number to convert
 * @returns The corresponding JWK algorithm identifier
 * @throws {Error} When the provided coseAlgorithm is not a valid COSE algorithm or is not a number
 *
 * @example
 * ```typescript
 * const jwkAlg = coseToJwkAlgorithm(Algorithm.ES256); // Returns 'ES256'
 * const edAlg = coseToJwkAlgorithm(Algorithm.EdDSA); // Returns 'EdDSA'
 *
 * // Throws error for invalid algorithms
 * coseToJwkAlgorithm(999); // Throws: Unsupported COSE algorithm for JWK conversion: 999
 * coseToJwkAlgorithm(null); // Throws: Unsupported COSE algorithm for JWK conversion: null
 * ```
 */
export const coseToJwkAlgorithm = (coseAlgorithm: unknown): JwkAlgorithm => {
  if (typeof coseAlgorithm !== 'number') {
    throw new Error(
      `Unsupported COSE algorithm for JWK conversion: ${coseAlgorithm}`
    );
  }

  const jwkAlgorithm = COSE_TO_JWK_ALGORITHM[coseAlgorithm];

  if (jwkAlgorithm == null) {
    throw new Error(
      `Unsupported COSE algorithm for JWK conversion: ${coseAlgorithm}`
    );
  }

  return jwkAlgorithm as JwkAlgorithm;
};
