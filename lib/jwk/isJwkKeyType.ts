import { JwkKeyType } from './types';

/**
 * Checks if a given string is a valid JWK key type.
 *
 * @param keyType - The string to check
 * @returns True if the keyType is a valid JwkKeyType value, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isJwkKeyType('EC'); // true
 * const isInvalid = isJwkKeyType('invalid-key-type'); // false
 *
 * // Use with type narrowing
 * if (isJwkKeyType(someKeyType)) {
 *   // someKeyType is now typed as JwkKeyType
 *   console.log(`Valid key type: ${someKeyType}`);
 * }
 * ```
 */
export const isJwkKeyType = (keyType: unknown): keyType is JwkKeyType => {
  if (typeof keyType !== 'string') {
    return false;
  }

  return Object.values(JwkKeyType).includes(keyType as JwkKeyType);
};
