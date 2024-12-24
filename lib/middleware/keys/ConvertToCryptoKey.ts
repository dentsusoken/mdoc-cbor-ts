import { ConvertToJWK } from './ConvertToJWK';
import { KeyKinds, KeyType } from './types';

/**
 * Function interface for converting JWK or COSEKey to CryptoKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @param {string} kid - Key ID
 * @returns {Promise<CryptoKey>} Converted CryptoKey
 */
export interface ConvertToCryptoKey {
  (key: KeyKinds, type: KeyType, kid: string): Promise<CryptoKey>;
}

/**
 * Creates a default implementation for converting JWK or COSEKey to CryptoKey
 * @param {ConvertToJWK} convertToJWK - ConvertToJWK implementation
 * @returns {ConvertToCryptoKey} ConvertToCryptoKey implementation
 */
export const createDefaultConvertToCryptoKey = (
  convertToJWK: ConvertToJWK
): ConvertToCryptoKey => {
  return async (key, type, kid) => {
    try {
      const jwk = await convertToJWK(key, type, kid);
      const usage = jwk.key_ops!;

      return await crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: 'ECDSA',
          namedCurve: jwk.crv!,
        },
        true,
        usage
      );
    } catch (error: unknown) {
      console.error(error);
      throw new Error('Failed to convert to CryptoKey.');
    }
  };
};
