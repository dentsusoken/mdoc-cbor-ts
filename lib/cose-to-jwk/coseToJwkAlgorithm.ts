import { COSE_TO_JWK_ALGORITHM } from './constants';
import { toAlgorithm } from '@/cose/toAlgorithm';
import { JwkAlgorithm } from '@/jwk/types';

/**
 * Converts a COSE algorithm to the corresponding JWK algorithm.
 *
 * @param algorithm - The COSE algorithm to convert (number or Algorithm enum value)
 * @returns The corresponding JWK algorithm identifier
 * @throws {Error} When the provided algorithm is not a valid COSE algorithm or cannot be converted to JWK
 */
export const coseToJwkAlgorithm = (algorithm: unknown): JwkAlgorithm => {
  const coseAlgorithm = toAlgorithm(algorithm);
  const jwkAlgorithm = COSE_TO_JWK_ALGORITHM[coseAlgorithm];

  if (jwkAlgorithm == null) {
    throw new Error(
      `Unsupported COSE algorithm for JWK conversion: ${coseAlgorithm}`
    );
  }

  return jwkAlgorithm;
};
