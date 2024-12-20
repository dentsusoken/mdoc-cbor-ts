import { COSEKey } from '@auth0/cose';
import { defaultConvertToJWK } from './ConvertToJWK';
import { KeyKinds, KeyType } from './types';

/**
 * Function interface for converting CryptoKey or JWK to COSEKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<COSEKey>} Converted COSEKey
 */
export interface ConvertToCoseKey {
  (key: KeyKinds, type: KeyType): Promise<COSEKey>;
}

/**
 * Default implementation for converting CryptoKey or JWK to COSEKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<COSEKey>} Converted COSEKey
 * @throws {Error} Throws when failed to convert
 */
export const defaultConvertToCoseKey: ConvertToCoseKey = async (key, type) => {
  try {
    const jwk = await defaultConvertToJWK(key, type);

    return COSEKey.fromJWK(jwk);
  } catch (e) {
    console.error(e);
    throw new Error('Failed to convert to CoseKey.');
  }
};
