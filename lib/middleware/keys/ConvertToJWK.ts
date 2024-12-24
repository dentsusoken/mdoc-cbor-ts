import { COSEKey } from '@auth0/cose';
import { exportJWK } from 'jose';
import { jwkSchema, JWK } from '../../schemas/keys';
import { KeyKinds, KeyType } from './types';
import { KeyConverterConfig } from './KeyConverterImpl';

/**
 * Function interface for converting CryptoKey or COSEKey to JWK
 * @param {KeyKinds} key - Source key (CryptoKey, JWK, or COSEKey)
 * @param {KeyType} type - Key type ('private' or 'public')
 * @param {string} kid - Key ID
 * @returns {Promise<JWK>} Converted JWK
 */
export interface ConvertToJWK {
  (key: KeyKinds, type: KeyType, kid: string): Promise<JWK>;
}

/**
 * Creates a default implementation for converting CryptoKey or JWK to COSEKey
 * @param {KeyConverterConfig} config - Configuration for key conversion
 * @returns {ConvertToJWK} ConvertToJWK implementation
 */
export const createDefaultConvertToJWK = (
  config: KeyConverterConfig
): ConvertToJWK => {
  return async (key, type, kid) => {
    try {
      // Convert input to JWK format
      const baseJWK =
        key instanceof CryptoKey
          ? await exportJWK(key)
          : key instanceof COSEKey
          ? key.toJWK()
          : key;
      // Validate input JWK format
      const validationResult = jwkSchema.safeParse(baseJWK);
      if (!validationResult.success) {
        throw new Error('Invalid JWK format');
      }

      // Create output JWK with required properties
      const jwk = {
        ...validationResult.data,
        kid,
        alg: config.KEY_ALGORITHM,
        crv: config.NAMED_CURVE,
        use: 'sig',
        key_ops: type === 'private' ? ['sign' as const] : ['verify' as const],
      };

      // Remove private components for public key
      if (type === 'public') {
        delete jwk.d;
        delete jwk.p;
        delete jwk.q;
        delete jwk.dp;
        delete jwk.dq;
        delete jwk.qi;
      }

      return jwk as JWK;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to convert to JWK.');
    }
  };
};
