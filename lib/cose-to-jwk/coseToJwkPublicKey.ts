import { JwkPublicKey } from '@/jwk/types';
import { coseToJwkKeyType } from './coseToJwkKeyType';
import { encodeBase64Url } from 'u8a-utils';
import { Key } from '@/cose/types';
import { coseToJwkAlgorithm } from './coseToJwkAlgorithm';
import { coseToJwkCurve } from './coseToJwkCurve';
import { resolveCurveName } from 'noble-curves-extended';

/**
 * Converts a COSE public key map to a JWK public key.
 *
 * @description
 * This function takes a COSE public key map and converts it into a JWK-compliant public key object.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 *
 * **EC Key Requirements:**
 * - `x` and `y` coordinates are required.
 * - `Curve` is optional. If `Curve` is missing, it will be derived from `Algorithm`:
 *   - ES256 → P-256
 *   - ES384 → P-384
 *   - ES512 → P-521
 * - If both `Algorithm` and `Curve` are missing, an error is thrown.
 * - The curve is resolved using {@link resolveCurveName} and included in the JWK `crv` field.
 * - The resulting JWK includes `kty`, `crv`, `x`, and `y` (no `alg` field).
 * - COSE_Key may include `Algorithm` only (curve can be derived from algorithm).
 *
 * **OKP Key Requirements:**
 * - `x` coordinate is required.
 * - `Curve` is required.
 * - `Algorithm` is optional and ignored if provided.
 * - The resulting JWK includes `kty`, `crv`, and `x` (no `alg` field).
 * - COSE_Key includes `Curve` only (algorithm is omitted as it can be derived from curve).
 *
 * To minimize COSE_Key size per mDL specification, only the minimum required parameters are included.
 *
 * @param coseKey - The COSE public key map to convert.
 * @returns A JWK public key object.
 * @throws {Error} If the key type is missing in the COSE key.
 * @throws {Error} If the key type is not a valid COSE key type.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If the curve cannot be determined for EC keys (both `Algorithm` and `Curve` are missing).
 * @throws {Error} If the algorithm is not a valid COSE algorithm.
 * @throws {Error} If the algorithm cannot be converted to a JWK algorithm.
 * @throws {Error} If the x coordinate is missing in the COSE key.
 * @throws {Error} If the x coordinate is not a Uint8Array.
 * @throws {Error} If the y coordinate is missing in an EC public key.
 * @throws {Error} If the y coordinate is not a Uint8Array in an EC public key.
 * @throws {Error} If the curve is missing in an OKP public key.
 * @throws {Error} If the curve is not a valid COSE curve.
 *
 * @example
 * ```typescript
 * // EC key example with explicit algorithm
 * const ecCoseKey1 = new Map([
 *   [Key.KeyType, 2], // EC
 *   [Key.Algorithm, -7], // ES256
 *   [Key.x, xCoordinateBytes],
 *   [Key.y, yCoordinateBytes],
 * ]);
 * const ecJwk1 = coseToJwkPublicKey(ecCoseKey1);
 * // Returns a JWK object with kty: 'EC', crv: 'P-256' (derived from ES256), x, and y (no alg)
 *
 * // EC key example with explicit curve
 * const ecCoseKey2 = new Map([
 *   [Key.KeyType, 2], // EC
 *   [Key.Curve, 1], // P-256
 *   [Key.x, xCoordinateBytes],
 *   [Key.y, yCoordinateBytes],
 * ]);
 * const ecJwk2 = coseToJwkPublicKey(ecCoseKey2);
 * // Returns a JWK object with kty: 'EC', crv: 'P-256', x, and y (no alg)
 *
 * // OKP key example (alg is optional and ignored)
 * const okpCoseKey = new Map([
 *   [Key.KeyType, 1], // OKP
 *   [Key.Curve, 6], // Ed25519
 *   [Key.x, publicKeyBytes],
 * ]);
 * const okpJwk = coseToJwkPublicKey(okpCoseKey);
 * // Returns a JWK object with kty: 'OKP', crv: 'Ed25519', and x (no alg)
 * ```
 */
export const coseToJwkPublicKey = (
  coseKey: Map<number, unknown>
): JwkPublicKey => {
  const coseKeyType = coseKey.get(Key.KeyType);
  if (coseKeyType == null) {
    throw new Error('Missing key type in COSE key');
  }
  const jwkKeyType = coseToJwkKeyType(coseKeyType);

  if (jwkKeyType !== 'EC' && jwkKeyType !== 'OKP') {
    throw new Error('Key type must be "EC" or "OKP"');
  }

  const coseCurve = coseKey.get(Key.Curve);
  const jwkCurve = coseCurve != null ? coseToJwkCurve(coseCurve) : undefined;

  const coseAlgorithm = coseKey.get(Key.Algorithm);
  const jwkAlgorithm =
    coseAlgorithm != null ? coseToJwkAlgorithm(coseAlgorithm) : undefined;

  const targetJwkCurve = resolveCurveName({
    curveName: jwkCurve,
    algorithmName: jwkAlgorithm,
  });

  const coseX = coseKey.get(Key.x);
  if (coseX == null) {
    const which = jwkKeyType === 'OKP' ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  if (!(coseX instanceof Uint8Array)) {
    throw new Error('x coordinate must be a Uint8Array');
  }
  const jwkX = encodeBase64Url(coseX);

  const jwk: JwkPublicKey = {
    kty: jwkKeyType,
    crv: targetJwkCurve,
    x: jwkX,
  };

  if (jwkKeyType === 'EC') {
    const coseY = coseKey.get(Key.y);
    if (coseY == null) {
      throw new Error('Missing y coordinate in EC public key');
    }
    if (!(coseY instanceof Uint8Array)) {
      throw new Error('y coordinate must be a Uint8Array');
    }
    const jwkY = encodeBase64Url(coseY);
    jwk.y = jwkY;
  }

  return jwk as JwkPublicKey;
};
