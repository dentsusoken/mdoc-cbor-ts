import { JwkPublicKey } from '@/jwk/types';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { KeyParam, KeyType } from './types';
import { jwkToCoseKeyOps } from './jwkToCoseKeyOps';
import { jwkToCoseCurveAlgorithm } from './jwkToCoseCurveAlgorithm';

/**
 * Converts a JWK public key to a COSE public key map.
 *
 * @param jwk - The JWK public key to convert.
 * @returns A Map representing the COSE public key.
 * @throws {Error} If the key type is not "EC" or "OKP".
 * @throws {Error} If required coordinates (x or y) are missing.
 *
 * @description
 * This function takes a JWK public key and converts it into a COSE-compliant public key map.
 * It supports both EC (Elliptic Curve) and OKP (Octet Key Pair, e.g., EdDSA) key types.
 * For EC keys, both x and y coordinates are required. For OKP keys, only x is required.
 * The function also maps curve, algorithm, and key operations if present.
 */
export const jwkToCosePublicKey = (jwk: JwkPublicKey): Map<number, unknown> => {
  const keyType = jwkToCoseKeyType(jwk.kty);

  if (keyType !== KeyType.EC && keyType !== KeyType.OKP) {
    throw new Error('Key type must be "EC" or "OKP"');
  }

  const { curve, algorithm } = jwkToCoseCurveAlgorithm(jwk);

  if (jwk.x == null) {
    const which = keyType === KeyType.OKP ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  const x = decodeBase64Url(jwk.x);

  const publicKey = new Map<number, unknown>([
    [KeyParam.KeyType, keyType],
    [KeyParam.Curve, curve],
    [KeyParam.Algorithm, algorithm],
    [KeyParam.x, x],
  ]);

  if (jwk.key_ops) {
    publicKey.set(KeyParam.KeyOps, jwkToCoseKeyOps(jwk.key_ops));
  }

  if (keyType === KeyType.EC) {
    if (jwk.y == null) {
      throw new Error('Missing y coordinate in EC public key');
    }

    const y = decodeBase64Url(jwk.y);
    publicKey.set(KeyParam.y, y);
  }

  return publicKey;
};
