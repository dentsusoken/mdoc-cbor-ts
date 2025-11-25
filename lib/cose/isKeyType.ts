import { KeyType } from './types';

/**
 * Checks if a given value is a valid COSE key type.
 *
 * @param keyType - The value to check
 * @returns True if the value is a valid COSE key type, false otherwise
 *
 * @example
 * ```typescript
 * isKeyType(KeyType.EC); // Returns true
 * isKeyType(2); // Returns true (EC)
 * isKeyType('EC'); // Returns false (not a number)
 * isKeyType(999); // Returns false (not a valid key type)
 * ```
 */
export const isKeyType = (keyType: unknown): keyType is KeyType => {
  if (typeof keyType !== 'number') {
    return false;
  }

  return Object.values(KeyType).includes(keyType);
};
