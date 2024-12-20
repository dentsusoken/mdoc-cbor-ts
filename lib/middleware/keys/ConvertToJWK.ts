import { COSEKey } from '@auth0/cose';
import { exportJWK } from 'jose';
import { jwkSchema, JWK } from '../../schemas/keys/jwk';
import { KeyKinds, KeyType } from './types';

/**
 * Function interface for converting CryptoKey or COSEKey to JWK
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<JWK>} Converted JWK
 */
export interface ConvertToJWK {
  (key: KeyKinds, type: KeyType): Promise<JWK>;
}

/**
 * Default implementation for converting CryptoKey or COSEKey to JWK
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @returns {Promise<JWK>} Converted JWK. Private key information (d) is removed for public type
 * @throws {Error} Throws when failed to convert or validate JWK
 */
export const defaultConvertToJWK: ConvertToJWK = async (key, type) => {
  try {
    const validationResult = jwkSchema.safeParse(
      key instanceof CryptoKey
        ? await exportJWK(key)
        : key instanceof COSEKey
        ? key.toJWK()
        : key
    );
    if (!validationResult.success) {
      throw new Error('Invalid JWK format');
    }
    const jwk = validationResult.data;

    if (type === 'public') {
      delete jwk.d;
      delete jwk.p;
      delete jwk.q;
      delete jwk.dp;
      delete jwk.dq;
      delete jwk.qi;
    }

    return jwk;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to convert to JWK.');
  }
};
