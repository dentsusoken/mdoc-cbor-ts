import { defaultConvertToJWK } from './ConvertToJWK';
import { KeyKinds, KeyType } from './types';

/**
 * Function interface for converting JWK or COSEKey to CryptoKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<CryptoKey>} Converted CryptoKey
 */
export interface ConvertToCryptoKey {
  (key: KeyKinds, type: KeyType): Promise<CryptoKey>;
}

/**
 * Default implementation for converting JWK or COSEKey to CryptoKey
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<CryptoKey>} Converted CryptoKey
 * @throws {Error} Throws when alg is undefined
 * @throws {Error} Throws when failed to convert
 */
export const defaultConvertToCryptoKey: ConvertToCryptoKey = async (
  key,
  type
) => {
  try {
    const jwk = await defaultConvertToJWK(key, type);

    if (!jwk.alg) {
      throw new Error('alg is undefined.');
    }

    const usage = type === 'private' ? 'sign' : 'verify';

    return await crypto.subtle.importKey('jwk', jwk, jwk.alg, true, [usage]);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error && error.message === 'alg is undefined.') {
      throw error;
    }
    throw new Error('Failed to convert to CryptoKey.');
  }
};
