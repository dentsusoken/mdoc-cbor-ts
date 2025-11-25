import { encodeBase64Url } from 'u8a-utils';
import { JwkKeyType, JwkMacAlgorithm, JwkOctKey } from './types';

/**
 * Parameters for generating a JWK Octet Sequence Key (JwkOctKey).
 */
type GenerateJwkOctKeyParams = {
  /** The MAC algorithm to be used with the key (e.g., HS256, HS384, HS512). */
  alg: JwkMacAlgorithm;
  /** The symmetric key value as a Uint8Array. */
  k: Uint8Array;
};

/**
 * Generates a JWK Octet Sequence Key (JwkOctKey) for symmetric cryptographic operations.
 *
 * @param params - The parameters for generating the JWK Octet Sequence Key.
 * @param params.alg - The MAC algorithm to be used with the key.
 * @param params.k - The symmetric key value as a Uint8Array.
 * @returns The generated JwkOctKey object.
 *
 * @example
 * ```typescript
 * const key = new Uint8Array([1, 2, 3, 4]);
 * const jwk = generateJwkOctKey({
 *   alg: JwkMacAlgorithms.HS256,
 *   k: key,
 * });
 * ```
 */
export const generateJwkOctKey = ({
  alg,
  k,
}: GenerateJwkOctKeyParams): JwkOctKey => {
  return {
    kty: JwkKeyType.oct,
    alg,
    k: encodeBase64Url(k),
  };
};
