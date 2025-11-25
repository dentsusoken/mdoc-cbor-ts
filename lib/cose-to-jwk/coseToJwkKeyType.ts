import { COSE_TO_JWK_KEY_TYPE } from './constants';
import { toKeyType } from '@/cose/toKeyType';
import { JwkKeyType } from '@/jwk/types';

/**
 * Converts a COSE key type to the corresponding JWK key type.
 *
 * @param keyType - The COSE key type to convert (number or KeyType enum value)
 * @returns The corresponding JWK key type identifier
 * @throws {Error} When the provided keyType is not a valid COSE key type
 *
 * @example
 * ```typescript
 * const jwkKeyType = coseToJwkKeyType(KeyType.EC); // Returns JwkKeyType.EC ('EC')
 * const octKeyType = coseToJwkKeyType(4); // Returns JwkKeyType.oct ('oct')
 *
 * // Throws error for invalid key types
 * coseToJwkKeyType(999); // Throws: Unsupported COSE key type: 999
 * coseToJwkKeyType('EC'); // Throws: Unsupported COSE key type: EC
 * ```
 */
export const coseToJwkKeyType = (keyType: unknown): JwkKeyType => {
  const coseKeyType = toKeyType(keyType);
  return COSE_TO_JWK_KEY_TYPE[coseKeyType];
};

