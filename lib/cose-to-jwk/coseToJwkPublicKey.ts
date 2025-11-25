import { JwkPublicKey } from '@/jwk/types';
import { coseToJwkKeyType } from './coseToJwkKeyType';
import { encodeBase64Url } from 'u8a-utils';
import { Key } from '@/cose/types';
import { coseToJwkAlgorithm } from './coseToJwkAlgorithm';
import { coseToJwkCurve } from './coseToJwkCurve';

/**
 * Converts a COSE public key map to a JWK public key.
 *
 * @description
 * This function takes a COSE public key map and converts it into a JWK-compliant public key object.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 * For EC keys, both x and y coordinates are required. For OKP keys, only x is required.
 * The function also maps algorithm and curve if present.
 *
 * @param coseKey - The COSE public key map to convert.
 * @returns A JWK public key object.
 * @throws {Error} If the key type is missing in the COSE key.
 * @throws {Error} If the key type is not a valid COSE key type.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If the algorithm is missing in the COSE key.
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
 * const coseKey = new Map([
 *   [Key.KeyType, KeyType.EC],
 *   [Key.Algorithm, Algorithm.ES256],
 *   [Key.x, xCoordinateBytes],
 *   [Key.y, yCoordinateBytes],
 * ]);
 * const jwk = coseToJwkPublicKey(coseKey);
 * // Returns a JWK object with kty, alg, crv, x, and y
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

  const coseAlgorithm = coseKey.get(Key.Algorithm);
  if (coseAlgorithm == null) {
    throw new Error('Missing algorithm in COSE key');
  }
  const jwkAlgorithm = coseToJwkAlgorithm(coseAlgorithm);

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
    alg: jwkAlgorithm,
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
