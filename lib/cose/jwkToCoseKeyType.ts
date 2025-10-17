import { toJwkKeyType } from '@/jwk/toJwkKeyType';
import { KeyType } from './types';
import { JWK_TO_COSE_KEY_TYPES } from './constants';

/**
 * Converts a JWK key type to the corresponding COSE key type.
 *
 * @param jwkKeyType - The JWK key type string to convert
 * @returns The corresponding COSE key type identifier
 * @throws {Error} When the provided jwkKeyType is not a valid JWK key type
 *
 * @example
 * ```typescript
 * const coseKeyType = jwkToCoseKeyType('EC'); // Returns KeyTypes.EC (2)
 * const octKeyType = jwkToCoseKeyType('oct'); // Returns KeyTypes.Symmetric (4)
 *
 * // Throws error for invalid key types
 * jwkToCoseKeyType('RSA'); // Throws: Unsupported JWK key type: RSA
 * ```
 */
export const jwkToCoseKeyType = (jwkKeyType: string): KeyType => {
  return JWK_TO_COSE_KEY_TYPES[toJwkKeyType(jwkKeyType)];
};
