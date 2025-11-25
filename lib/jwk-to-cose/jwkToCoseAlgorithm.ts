import { JWK_TO_COSE_ALGORITHM } from './constants';
import { toJwkAlgorithm } from '@/jwk/toJwkAlgorithm';
import { Algorithm } from '@/cose/types';

/**
 * Converts a JWK algorithm to the corresponding COSE algorithm.
 *
 * @param algorithm - The JWK algorithm string to convert
 * @returns The corresponding COSE algorithm identifier
 * @throws {Error} When the provided jwkAlgorithm is not a valid JWK algorithm
 */
export const jwkToCoseAlgorithm = (algorithm: string): Algorithm => {
  return JWK_TO_COSE_ALGORITHM[toJwkAlgorithm(algorithm)];
};
