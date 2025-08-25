import { crvToAlg } from '@/utils/crvToAlg';
import {
  COSEKey,
  COSEKeyParam,
  Curve,
  Headers,
  ProtectedHeaders,
} from '@auth0/cose';

/**
 * Builds protected headers for COSE (CBOR Object Signing and Encryption) operations.
 *
 * This function extracts the algorithm and optional key ID from a COSE key and constructs
 * the appropriate protected headers. The algorithm is always included, while the key ID
 * is only included if present in the COSE key.
 *
 * @param coseKey - The COSE key containing algorithm and optional key ID parameters
 * @returns A ProtectedHeaders instance with the algorithm and optional key ID
 * @throws {Error} When the algorithm is not found in the COSE key
 *
 * @example
 * ```typescript
 * const coseKey = COSEKey.fromJWK({
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256',
 *   kid: 'key-123'
 * });
 *
 * const protectedHeaders = buildProtectedHeaders(coseKey);
 * // Returns ProtectedHeaders with algorithm 'ES256' and key ID 'key-123'
 * ```
 *
 * @example
 * ```typescript
 * const coseKey = COSEKey.fromJWK({
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256'
 *   // No kid parameter
 * });
 *
 * const protectedHeaders = buildProtectedHeaders(coseKey);
 * // Returns ProtectedHeaders with only algorithm 'ES256'
 * ```
 */
export const buildProtectedHeaders = (coseKey: COSEKey): ProtectedHeaders => {
  const alg =
    coseKey.get(COSEKeyParam.Algorithm) ||
    crvToAlg(coseKey.get(COSEKeyParam.Curve) as Curve | undefined);
  const kid = coseKey.get(COSEKeyParam.KeyID);

  if (!alg) {
    throw new Error('Algorithm not found in COSE key');
  }

  return new ProtectedHeaders(
    kid
      ? [
          [Headers.Algorithm, alg],
          [Headers.KeyID, kid],
        ]
      : [[Headers.Algorithm, alg]]
  );
};
