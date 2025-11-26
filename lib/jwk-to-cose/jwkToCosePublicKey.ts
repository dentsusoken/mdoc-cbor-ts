import { JwkAlgorithm, JwkCurve, JwkPublicKey } from '@/jwk/types';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { Key, KeyType } from '@/cose/types';
import { jwkToCoseAlgorithm } from './jwkToCoseAlgorithm';
import { jwkToCoseCurve } from './jwkToCoseCurve';

const JWK_EC_CURVE_TO_JWK_EC_ALGORITHM: Record<string, string> = {
  [JwkCurve.P256]: JwkAlgorithm.ES256,
  [JwkCurve.P384]: JwkAlgorithm.ES384,
  [JwkCurve.P521]: JwkAlgorithm.ES512,
};

/**
 * Converts a JWK public key to a COSE public key map.
 *
 * @description
 * This function takes a JWK public key and converts it into a COSE-compliant public key map.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 *
 * **EC Key Requirements:**
 * - `x` and `y` coordinates are required.
 * - `alg` is preferred if provided. If `alg` is missing, it will be derived from `crv`:
 *   - P-256 → ES256
 *   - P-384 → ES384
 *   - P-521 → ES512
 * - If both `alg` and `crv` are missing, an error is thrown.
 * - COSE_Key includes `Algorithm` only (curve is omitted as it can be derived from algorithm).
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
 * @throws {Error} If the algorithm cannot be determined for EC keys (both `alg` and `crv` are missing).
 * @throws {Error} If required coordinates (x or y) are missing.
 * @throws {Error} If the curve is missing for OKP keys.
 *
 * @example
 * ```typescript
 * // EC key example with explicit algorithm
 * const ecJwkWithAlg: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256',
 *   x: 'base64url-encoded-x',
 *   y: 'base64url-encoded-y',
 * };
 * const ecCoseKey1 = jwkToCosePublicKey(ecJwkWithAlg);
 * // Returns a Map with KeyType, Algorithm, x, and y (no Curve)
 *
 * // EC key example with algorithm derived from curve
 * const ecJwkWithoutAlg: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x',
 *   y: 'base64url-encoded-y',
 * };
 * const ecCoseKey2 = jwkToCosePublicKey(ecJwkWithoutAlg);
 * // Returns a Map with KeyType, Algorithm (ES256 derived from P-256), x, and y
 *
 * // OKP key example (alg is optional and ignored)
 * const okpJwk: JwkPublicKey = {
 *   kty: 'OKP',
 *   crv: 'Ed25519',
 *   x: 'base64url-encoded-public-key',
 * };
 * const okpCoseKey = jwkToCosePublicKey(okpJwk);
 * // Returns a Map with KeyType, Curve, and x (no Algorithm)
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

  const publicKey = new Map<number, unknown>([
    [Key.KeyType, keyType],
    [Key.x, x],
  ]);

  if (keyType === KeyType.EC) {
    const jwkAlg =
      jwk.alg ??
      (jwk.crv ? JWK_EC_CURVE_TO_JWK_EC_ALGORITHM[jwk.crv] : undefined);

    if (jwkAlg == null) {
      throw new Error('Missing algorithm in EC public key');
    }

    const algorithm = jwkToCoseAlgorithm(jwkAlg);
    publicKey.set(Key.Algorithm, algorithm);

    if (jwk.y == null) {
      throw new Error('Missing y coordinate in EC public key');
    }

    const y = decodeBase64Url(jwk.y);
    publicKey.set(Key.y, y);
  } else if (keyType === KeyType.OKP) {
    if (jwk.crv == null) {
      throw new Error('Missing curve in OKP public key');
    }

    const curve = jwkToCoseCurve(jwk.crv);
    publicKey.set(Key.Curve, curve);
  }

  return publicKey;
};
