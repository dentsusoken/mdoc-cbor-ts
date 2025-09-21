import { EcPublicJwk } from '@/jwk/types';
import { EcPublicKey } from './EcPublicKey';
import { jwkToCoseKeyType } from './jwkToCoseKeyType';
import { jwkToCoseAlgorithm } from './jwkToCoseAlgorithm';
import { CURVES_TO_ALGORITHMS } from './constants';
import { jwkToCoseCurve } from './jwkToCoseCurve';
import { decodeBase64Url } from 'u8a-utils';
import { KeyParams } from './types';
import { jwkToCoseKeyOps } from './jwkToCoseKeyOps';

const encoder = new TextEncoder();

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
export const jwkToCoseEcPublicKey = (jwk: EcPublicJwk): EcPublicKey => {
  if (jwk.kty !== 'EC') {
    throw new Error('Key type must be "EC"');
  }

  const keyType = jwkToCoseKeyType(jwk.kty);

  if (jwk.crv == null) {
    throw new Error('Missing curve in EC public key');
  }

  const curve = jwkToCoseCurve(jwk.crv);

  const algorithm = jwk.alg
    ? jwkToCoseAlgorithm(jwk.alg)
    : CURVES_TO_ALGORITHMS[curve];

  if (jwk.x == null) {
    throw new Error('Missing x coordinate in EC public key');
  }

  const x = decodeBase64Url(jwk.x);

  if (jwk.y == null) {
    throw new Error('Missing y coordinate in EC public key');
  }

  const y = decodeBase64Url(jwk.y);

  const publicKey = new EcPublicKey([
    [KeyParams.KeyType, keyType],
    [KeyParams.Curve, curve],
    [KeyParams.Algorithm, algorithm],
    [KeyParams.x, x],
    [KeyParams.y, y],
  ]);

  if (jwk.kid) {
    const kid = encoder.encode(jwk.kid);
    publicKey.set(KeyParams.KeyID, kid);
  }

  if (jwk.key_ops) {
    publicKey.set(KeyParams.KeyOps, jwkToCoseKeyOps(jwk.key_ops));
  }

  return publicKey;
};
