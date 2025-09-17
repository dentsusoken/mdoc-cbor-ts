import { JWK_CRV_TO_JWS_ALG } from '@/jws/constants';
import { Headers } from '@/cose/types';
import { ProtectedHeaders } from '@/cose/ProtectedHeaders';
import { ECPublicJwk } from '@/jwk/types';
import { JWS_TO_COSE_ALGORITHMS } from '@/cose/constants';
import { JwsAlgorithms } from '@/jws/types';

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
  publicJwk: ECPublicJwk
): ProtectedHeaders => {
  const { alg, crv, kid } = publicJwk;

  if (!alg && !crv) {
    throw new Error('Missing algorithm or curve in EC public key');
  }

  const jwsAlg = alg || JWK_CRV_TO_JWS_ALG[crv];

  if (!jwsAlg) {
    throw new Error('Missing algorithm in EC public key');
  }

  const coseAlg = JWS_TO_COSE_ALGORITHMS[jwsAlg as JwsAlgorithms];

  if (!coseAlg) {
    throw new Error('Missing algorithm in JWS to COSE mapping');
  }

  const protectedHeaders = new ProtectedHeaders([[Headers.Algorithm, coseAlg]]);

  if (kid) {
    const coseKid = new TextEncoder().encode(kid);
    protectedHeaders.set(Headers.KeyID, coseKid);
  }

  return protectedHeaders;
};
