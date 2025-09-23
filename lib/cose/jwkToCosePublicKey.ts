import { JwkPublicKey } from '@/jwk/types';
import { PublicKey } from './PublicKey';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { decodeBase64Url } from 'u8a-utils';
import { KeyParams, KeyTypes } from './types';
import { jwkToCoseKeyOps } from './jwkToCoseKeyOps';
import { jwkToCoseCurveAlgorithmKeyId } from './jwkToCoseCurveAlgorithmKeyId';

/**
 * Converts an EC public key from JWK format to COSE format
 * @description
 * Transforms an Elliptic Curve public key from JSON Web Key (JWK) format
 * to CBOR Object Signing and Encryption (COSE) format. The function validates
 * the input JWK and extracts the necessary parameters to create a COSE EC public key.
 *
 * @param jwk - The EC public key in JWK format
 * @returns The EC public key in COSE format
 * @throws {Error} When the key type is not "EC"
 * @throws {Error} When the curve parameter is missing
 * @throws {Error} When the x coordinate is missing
 * @throws {Error} When the y coordinate is missing
 *
 * @example
 * ```typescript
 * const jwkKey: EcPublicJwk = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 *
 * const coseKey = jwkToCoseECPublicKey(jwkKey);
 * ```
 */
export const jwkToCosePublicKey = (jwk: JwkPublicKey): PublicKey => {
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

    const publicKey = new PublicKey([
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
  const publicKey = new PublicKey([
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
