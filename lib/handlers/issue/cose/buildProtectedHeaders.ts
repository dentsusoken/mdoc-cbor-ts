import { Headers } from '@/cose/types';
import { ProtectedHeaders } from '@/cose/ProtectedHeaders';
import { EcPublicJwk } from '@/jwk/types';
import { jwkToCoseCurveAlgorithmKeyId } from '@/cose/jwkToCoseCurveAlgorithmKeyId';

/**
 * Builds protected headers for COSE (CBOR Object Signing and Encryption) operations.
 *
 * This function extracts the algorithm and optional key ID from an EC public key JWK and constructs
 * the appropriate COSE protected headers. The algorithm is determined from either the explicit 'alg'
 * parameter or derived from the 'crv' (curve) parameter using the JWK curve to JWS algorithm mapping.
 * The algorithm is then converted from JWS format to COSE format using the JWS to COSE algorithm mapping.
 * The key ID is encoded as UTF-8 bytes and only included if present in the JWK.
 *
 * @param publicJwk - The EC public key JWK containing algorithm/curve and optional key ID parameters
 * @returns A ProtectedHeaders instance with the COSE algorithm and optional key ID (encoded as Uint8Array)
 * @throws {Error} When both algorithm and curve are missing from the EC public key
 * @throws {Error} When the algorithm cannot be determined from the JWK parameters
 * @throws {Error} When the JWS algorithm is not found in the JWS to COSE mapping
 *
 * @example
 * ```typescript
 * const publicJwk: ECPublicJwk = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate',
 *   kid: 'key-123'
 * };
 *
 * const protectedHeaders = buildProtectedHeaders(publicJwk);
 * // Returns ProtectedHeaders with COSE algorithm -7 (ES256) and key ID encoded as Uint8Array
 * ```
 *
 * @example
 * ```typescript
 * const publicJwk: ECPublicJwk = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 *   // No alg or kid parameters
 * };
 *
 * const protectedHeaders = buildProtectedHeaders(publicJwk);
 * // Returns ProtectedHeaders with COSE algorithm -7 (ES256) derived from P-256 curve
 * ```
 */
export const buildProtectedHeaders = (
  publicJwk: EcPublicJwk
): ProtectedHeaders => {
  const { algorithm, keyId } = jwkToCoseCurveAlgorithmKeyId(publicJwk);

  const protectedHeaders = new ProtectedHeaders([
    [Headers.Algorithm, algorithm],
  ]);

  if (keyId) {
    protectedHeaders.set(Headers.KeyId, keyId);
  }

  return protectedHeaders;
};
