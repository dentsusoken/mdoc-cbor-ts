import { JwkPublicKey } from '@/jwk/types';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { Key, KeyType } from '@/cose/types';
import { jwkToCoseAlgorithm } from './jwkToCoseAlgorithm';
import { jwkToCoseCurve } from './jwkToCoseCurve';

/**
 * Converts a JWK public key to a COSE public key map.
 *
 * @description
 * This function takes a JWK public key and converts it into a COSE-compliant public key map.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 * For EC keys, both x and y coordinates are required. For OKP keys, only x is required.
 * The function also maps algorithm and curve if present.
 *
 * @param jwk - The JWK public key to convert.
 * @returns A Map representing the COSE public key.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If the algorithm is missing.
 * @throws {Error} If required coordinates (x or y) are missing.
 *
 * @example
 * ```typescript
 * const jwk: JwkPublicKey = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   alg: 'ES256',
 *   x: 'base64url-encoded-x',
 *   y: 'base64url-encoded-y',
 * };
 * const coseKey = jwkToCosePublicKey(jwk);
 * // Returns a Map with KeyType, Algorithm, x, and y
 * ```
 */
export const jwkToCosePublicKey = (jwk: JwkPublicKey): Map<number, unknown> => {
  const keyType = jwkToCoseKeyType(jwk.kty);

  if (keyType !== KeyType.EC && keyType !== KeyType.OKP) {
    throw new Error('Key type must be "EC" or "OKP"');
  }

  if (jwk.alg == null) {
    throw new Error('Missing algorithm in JWK');
  }

  const algorithm = jwkToCoseAlgorithm(jwk.alg);

  if (jwk.x == null) {
    const which = keyType === KeyType.OKP ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  const x = decodeBase64Url(jwk.x);

  const publicKey = new Map<number, unknown>([
    [Key.KeyType, keyType],
    [Key.Algorithm, algorithm],
    [Key.x, x],
  ]);

  if (keyType === KeyType.EC) {
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
