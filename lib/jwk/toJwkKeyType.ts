import { isJwkKeyType } from './isJwkKeyType';
import { JwkKeyType } from './types';

/**
 * Converts a string to a valid JWK key type.
 *
 * @param keyType - The string to convert to a JWK key type
 * @returns The validated JWK key type
 * @throws {Error} When the provided keyType is not a valid JWK key type
 *
 * @example
 * ```typescript
 * const keyType = toJwkKeyType('EC'); // Returns JwkKeyTypes.EC
 * const octKeyType = toJwkKeyType('oct'); // Returns JwkKeyTypes.oct
 *
 * // Throws error for invalid key types
 * toJwkKeyType('RSA'); // Throws: Unsupported JWK key type: RSA
 * ```
 */
export const toJwkKeyType = (keyType: string): JwkKeyType => {
  if (isJwkKeyType(keyType)) {
    return keyType;
  }

  throw new Error(`Unsupported JWK key type: ${keyType}`);
};
