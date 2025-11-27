import { JwkPublicKey } from '@/jwk/types';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { Key, KeyType } from '@/cose/types';
import { jwkToCoseCurve } from './jwkToCoseCurve';
import { resolveCurveName } from 'noble-curves-extended';

/**
 * Converts a JWK public key to a COSE public key map.
 *
 * @description
 * This function takes a JWK public key and converts it into a COSE-compliant public key map.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 *
 * **EC Key Requirements:**
 * - `x` and `y` coordinates are required.
 * - `crv` is optional. If `crv` is missing, it will be derived from `alg`:
 *   - ES256 → P-256
 *   - ES384 → P-384
 *   - ES512 → P-521
 * - If both `alg` and `crv` are missing, an error is thrown.
 * - COSE_Key includes `Curve` only (algorithm is omitted as it can be derived from curve).
 *
 * **OKP Key Requirements:**
 * - `x` coordinate is required.
 * - `crv` is required.
 * - `alg` is optional and ignored if provided.
 * - COSE_Key includes `Curve` only (algorithm is omitted as it can be derived from curve).
 *
 * To minimize COSE_Key size per mDL specification, only the minimum required parameters are included.
 *
 * @param jwk - The JWK public key to convert.
 * @returns A Map representing the COSE public key.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If the curve cannot be determined for EC keys (both `alg` and `crv` are missing).
 * @throws {Error} If required coordinates (x or y) are missing.
 * @throws {Error} If the curve is missing for OKP keys.
 *
 * @example
 * ```typescript
 * // EC key example with explicit curve
 * const ecJwkWithCrv: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256',
 *   x: 'base64url-encoded-x',
 *   y: 'base64url-encoded-y',
 * };
 * const ecCoseKey1 = jwkToCosePublicKey(ecJwkWithCrv);
 * // Returns a Map with KeyType, Curve (P-256), x, and y (no Algorithm)
 *
 * // EC key example with curve derived from algorithm
 * const ecJwkWithoutCrv: JwkPublicKey = {
 *   kty: 'EC',
 *   alg: 'ES256',
 *   x: 'base64url-encoded-x',
 *   y: 'base64url-encoded-y',
 * };
 * const ecCoseKey2 = jwkToCosePublicKey(ecJwkWithoutCrv);
 * // Returns a Map with KeyType, Curve (P-256 derived from ES256), x, and y
 *
 * // OKP key example (alg is optional and ignored)
 * const okpJwk: JwkPublicKey = {
 *   kty: 'OKP',
 *   crv: 'Ed25519',
 *   x: 'base64url-encoded-public-key',
 * };
 * const okpCoseKey = jwkToCosePublicKey(okpJwk);
 * // Returns a Map with KeyType, Curve (Ed25519), and x (no Algorithm)
 * ```
 */
export const jwkToCosePublicKey = (jwk: JwkPublicKey): Map<number, unknown> => {
  const keyType = jwkToCoseKeyType(jwk.kty);

  if (keyType !== KeyType.EC && keyType !== KeyType.OKP) {
    throw new Error('Key type must be "EC" or "OKP"');
  }

  if (jwk.x == null) {
    const which = keyType === KeyType.OKP ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  const x = decodeBase64Url(jwk.x);

  const jwkCurve = resolveCurveName({
    curveName: jwk.crv,
    algorithmName: jwk.alg,
  });
  const curve = jwkToCoseCurve(jwkCurve);

  const publicKey = new Map<number, unknown>([
    [Key.KeyType, keyType],
    [Key.Curve, curve],
    [Key.x, x],
  ]);

  if (keyType === KeyType.EC) {
    if (jwk.y == null) {
      throw new Error('Missing y coordinate in EC public key');
    }

    const y = decodeBase64Url(jwk.y);
    publicKey.set(Key.y, y);
  }

  return publicKey;
};
