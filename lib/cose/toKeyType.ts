import { isKeyType } from './isKeyType';
import { KeyType } from './types';

/**
 * Converts a value to a valid COSE key type.
 *
 * @param keyType - The value to convert to a COSE key type
 * @returns The validated COSE key type
 * @throws {Error} When the provided value is not a valid COSE key type
 *
 * @example
 * ```typescript
 * const keyType = toKeyType(KeyType.EC); // Returns KeyType.EC
 * const okpKeyType = toKeyType(1); // Returns KeyType.OKP
 *
 * // Throws error for invalid key types
 * toKeyType(999); // Throws: Unsupported COSE key type: 999
 * toKeyType('EC'); // Throws: Unsupported COSE key type: EC
 * ```
 */
export const toKeyType = (keyType: unknown): KeyType => {
  if (isKeyType(keyType)) {
    return keyType;
  }

  throw new Error(`Unsupported COSE key type: ${keyType}`);
};
