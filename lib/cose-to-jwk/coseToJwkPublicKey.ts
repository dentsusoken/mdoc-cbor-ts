import { JwkPublicKey } from '@/jwk/types';
import { coseToJwkKeyType } from './coseToJwkKeyType';
import { encodeBase64Url } from 'u8a-utils';
import { Algorithm, Curve, Key } from '@/cose/types';
import { coseToJwkAlgorithm } from './coseToJwkAlgorithm';
import { coseToJwkCurve } from './coseToJwkCurve';

/**
 * Mapping from COSE EC curve to COSE EC algorithm.
 * Used to derive algorithm from curve when algorithm is missing in COSE_Key.
 */
const COSE_EC_CURVE_TO_COSE_EC_ALGORITHM: Record<number, number> = {
  [Curve.P256]: Algorithm.ES256,
  [Curve.P384]: Algorithm.ES384,
  [Curve.P521]: Algorithm.ES512,
};

/**
 * Converts a COSE public key map to a JWK public key.
 *
 * @description
 * This function takes a COSE public key map and converts it into a JWK-compliant public key object.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 *
 * **EC Key Requirements:**
 * - `x` and `y` coordinates are required.
 * - `Algorithm` is preferred if provided. If `Algorithm` is missing, it will be derived from `Curve`:
 *   - P-256 → ES256
 *   - P-384 → ES384
 *   - P-521 → ES512
 * - If both `Algorithm` and `Curve` are missing, an error is thrown.
 * - The algorithm is converted to JWK `alg` field.
 * - COSE_Key includes `Algorithm` only (curve is omitted as it can be derived from algorithm).
 *
 * **OKP Key Requirements:**
 * - `x` coordinate is required.
 * - `Curve` is required.
 * - `Algorithm` is optional and ignored if provided.
 * - COSE_Key includes `Curve` only (algorithm is omitted as it can be derived from curve).
 *
 * To minimize COSE_Key size per mDL specification, only the minimum required parameters are included.
 *
 * @param coseKey - The COSE public key map to convert.
 * @returns A JWK public key object.
 * @throws {Error} If the key type is missing in the COSE key.
 * @throws {Error} If the key type is not a valid COSE key type.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If the algorithm cannot be determined for EC keys (both `Algorithm` and `Curve` are missing).
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
 *   [Key.KeyType, KeyType.EC],
 *   [Key.Algorithm, Algorithm.ES256],
 *   [Key.x, xCoordinateBytes],
 *   [Key.y, yCoordinateBytes],
 * ]);
 * const ecJwk1 = coseToJwkPublicKey(ecCoseKey1);
 * // Returns a JWK object with kty: 'EC', alg: 'ES256', x, and y (no crv)
 *
 * // EC key example with algorithm derived from curve
 * const ecCoseKey2 = new Map([
 *   [Key.KeyType, KeyType.EC],
 *   [Key.Curve, Curve.P256],
 *   [Key.x, xCoordinateBytes],
 *   [Key.y, yCoordinateBytes],
 * ]);
 * const ecJwk2 = coseToJwkPublicKey(ecCoseKey2);
 * // Returns a JWK object with kty: 'EC', alg: 'ES256' (derived from P-256), x, and y
 *
 * // OKP key example (alg is optional and ignored)
 * const okpCoseKey = new Map([
 *   [Key.KeyType, KeyType.OKP],
 *   [Key.Curve, Curve.Ed25519],
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

  const coseX = coseKey.get(Key.x);
  if (coseX == null) {
    const which = jwkKeyType === 'OKP' ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  if (!(coseX instanceof Uint8Array)) {
    throw new Error('x coordinate must be a Uint8Array');
  }
  const jwkX = encodeBase64Url(coseX);

  const jwk: Partial<JwkPublicKey> = {
    kty: jwkKeyType,
    x: jwkX,
  };

  if (jwkKeyType === 'EC') {
    const coseAlgorithm = coseKey.get(Key.Algorithm);
    const coseCurve = coseKey.get(Key.Curve);

    const targetCoseAlgorithm =
      coseAlgorithm ??
      (typeof coseCurve === 'number'
        ? COSE_EC_CURVE_TO_COSE_EC_ALGORITHM[coseCurve]
        : undefined);

    if (targetCoseAlgorithm == null) {
      throw new Error('Missing algorithm in EC COSE key');
    }

    const jwkAlg = coseToJwkAlgorithm(targetCoseAlgorithm);

    jwk.alg = jwkAlg;

    const coseY = coseKey.get(Key.y);
    if (coseY == null) {
      throw new Error('Missing y coordinate in EC public key');
    }
    if (!(coseY instanceof Uint8Array)) {
      throw new Error('y coordinate must be a Uint8Array');
    }
    const jwkY = encodeBase64Url(coseY);
    jwk.y = jwkY;
  } else if (jwkKeyType === 'OKP') {
    const coseCurve = coseKey.get(Key.Curve);
    if (coseCurve == null) {
      throw new Error('Missing curve in OKP public key');
    }
    const jwkCurve = coseToJwkCurve(coseCurve);
    jwk.crv = jwkCurve;
  }

  return jwk as JwkPublicKey;
};
