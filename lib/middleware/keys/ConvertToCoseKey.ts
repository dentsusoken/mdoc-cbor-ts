import { COSEKey } from '@auth0/cose';
import { ConvertToJWK } from './ConvertToJWK';
import { KeyKinds, KeyType } from './types';

/**
 * Function interface for converting CryptoKey or JWK to COSEKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @param {string} kid - Key ID
 * @returns {Promise<COSEKey>} Converted COSEKey
 */
export interface ConvertToCoseKey {
  (key: KeyKinds, type: KeyType, kid: string): Promise<COSEKey>;
}

/**
 * Creates a default implementation for converting CryptoKey or JWK to COSEKey
 * @param {ConvertToJWK} convertToJWK - ConvertToJWK implementation
 * @returns {ConvertToCoseKey} ConvertToCoseKey implementation
 */
export const createDefaultConvertToCoseKey = (
  // config: KeyConverterConfig,
  convertToJWK: ConvertToJWK
): ConvertToCoseKey => {
  return async (key, type, kid) => {
    try {
      const jwk = await convertToJWK(key, type, kid);

      return COSEKey.fromJWK(jwk);
    } catch (e) {
      console.error(e);
      throw new Error('Failed to convert to CoseKey.');
    }
  };
};
