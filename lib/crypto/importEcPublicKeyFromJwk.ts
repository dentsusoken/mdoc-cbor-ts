import { ECPublicJWK } from './types';

/**
 * Imports an EC public key from JWK format into Web Crypto API
 * @description
 * Takes an elliptic curve public key in JWK format and imports it
 * into the Web Crypto API as a CryptoKey for ECDSA verification operations.
 * Supports P-256, P-384, and P-521 curves.
 *
 * @param jwk - The EC public key in JWK format with kty: 'EC' and supported curve
 * @returns A promise that resolves to a CryptoKey configured for ECDSA verification
 *
 * @throws {Error} When the JWK format is invalid or the curve is unsupported
 *
 * @example
 * ```typescript
 * const publicKeyJwk: ECPublicJWK = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 * const cryptoKey = await importEcPublicKeyFromJwk(publicKeyJwk);
 *
 * // Use the key for verification
 * const isValid = await crypto.subtle.verify(
 *   { name: 'ECDSA', hash: { name: 'SHA-256' } },
 *   cryptoKey,
 *   signature,
 *   data
 * );
 * ```
 */
export const importEcPublicKeyFromJwk = async (
  jwk: ECPublicJWK
): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: jwk.crv },
    false,
    ['verify']
  );
};
