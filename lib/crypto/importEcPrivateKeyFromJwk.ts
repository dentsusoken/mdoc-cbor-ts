import { ECPrivateJwk } from './types';

/**
 * Imports an EC private key from a JWK (JSON Web Key) format.
 *
 * @param jwk - The EC private key in JWK format
 * @returns A promise that resolves to a CryptoKey for ECDSA signing operations
 */
export const importEcPrivateKeyFromJwk = async (
  jwk: ECPrivateJwk
): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: jwk.crv },
    false,
    ['sign']
  );
};
