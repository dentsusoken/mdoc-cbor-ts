import { Headers } from '@/cose/types';
import { JwkPublicKey } from '@/jwk/types';
import { jwkToCoseCurveAlgorithmKeyId } from '@/cose/jwkToCoseCurveAlgorithmKeyId';

/**
 * Builds protected headers for COSE signing operations.
 *
 * @description
 * Creates a Map of protected headers containing the algorithm identifier and optionally
 * the key identifier derived from the provided JWK public key. The algorithm is determined
 * based on the curve type of the public key, and the key ID is included if available.
 *
 * Protected headers are cryptographically protected as part of the COSE signature and
 * cannot be modified without invalidating the signature.
 *
 * @param jwkPublicKey - The JWK public key to derive headers from
 * @returns A Map containing the protected headers with algorithm and optional key ID
 *
 * @example
 * ```typescript
 * const jwkPublicKey: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 *
 * const headers = buildProtectedHeaders(jwkPublicKey);
 * // headers.get(Headers.Algorithm) === Algorithms.ES256
 * // headers.get(Headers.KeyId) === keyId (if present)
 * ```
 */
export const buildProtectedHeaders = (
  jwkPublicKey: JwkPublicKey
): Map<number, unknown> => {
  const { algorithm, keyId } = jwkToCoseCurveAlgorithmKeyId(jwkPublicKey);

  const protectedHeaders = new Map<number, unknown>([
    [Headers.Algorithm, algorithm],
  ]);

  if (keyId) {
    protectedHeaders.set(Headers.KeyId, keyId);
  }

  return protectedHeaders;
};
