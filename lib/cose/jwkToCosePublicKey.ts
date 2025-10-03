import { JwkPublicKey } from '@/jwk/types';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { KeyParams, KeyTypes } from './types';
import { jwkToCoseKeyOps } from './jwkToCoseKeyOps';
import { jwkToCoseCurveAlgorithmKeyId } from './jwkToCoseCurveAlgorithmKeyId';

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
 * The function also maps curve, algorithm, key ID, and key operations if present.
 */
export const jwkToCosePublicKey = (jwk: JwkPublicKey): Map<number, unknown> => {
  const keyType = jwkToCoseKeyType(jwk.kty);

  if (keyType !== KeyTypes.EC && keyType !== KeyTypes.OKP) {
    throw new Error('Key type must be "EC" or "OKP"');
  }

  const { curve, algorithm, keyId } = jwkToCoseCurveAlgorithmKeyId(jwk);

  if (jwk.x == null) {
    const which = keyType === KeyTypes.OKP ? 'OKP' : 'EC';
    throw new Error(`Missing x coordinate in ${which} public key`);
  }
  const x = decodeBase64Url(jwk.x);

  if (keyType === KeyTypes.EC) {
    if (jwk.y == null) {
      throw new Error('Missing y coordinate in EC public key');
    }
    const y = decodeBase64Url(jwk.y);

    const publicKey = new Map<number, unknown>([
      [KeyParams.KeyType, keyType],
      [KeyParams.Curve, curve],
      [KeyParams.Algorithm, algorithm],
      [KeyParams.x, x],
      [KeyParams.y, y],
    ]);

    if (keyId) {
      publicKey.set(KeyParams.KeyId, keyId);
    }

    if (jwk.key_ops) {
      publicKey.set(KeyParams.KeyOps, jwkToCoseKeyOps(jwk.key_ops));
    }

    return publicKey;
  }

  // OKP (EdDSA) public key: only x is required; y is not used
  const publicKey = new Map<number, unknown>([
    [KeyParams.KeyType, keyType],
    [KeyParams.Curve, curve],
    [KeyParams.Algorithm, algorithm],
    [KeyParams.x, x],
  ]);

  if (keyId) {
    publicKey.set(KeyParams.KeyId, keyId);
  }

  if (jwk.key_ops) {
    publicKey.set(KeyParams.KeyOps, jwkToCoseKeyOps(jwk.key_ops));
  }

  return publicKey;
};
