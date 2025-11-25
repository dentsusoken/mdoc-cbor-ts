import { isJwkKeyType } from './isJwkKeyType';
import { JwkKeyType } from './types';

/**
 * Converts a value to a valid JWK key type.
 *
 * @param keyType - The value to convert to a JWK key type
 * @returns The validated JWK key type
 * @throws {Error} When the provided value is not a valid JWK key type
 *
 * @example
 * ```typescript
 * const keyType = toJwkKeyType(JwkKeyType.EC); // Returns JwkKeyType.EC
 * const okpKeyType = toJwkKeyType('OKP'); // Returns JwkKeyType.OKP
 *
 * // Throws error for invalid key types
 * toJwkKeyType(999); // Throws: Unsupported JWK key type: 999
 * toJwkKeyType('InvalidKeyType'); // Throws: Unsupported JWK key type: InvalidKeyType
 * ```
 */
export const toJwkKeyType = (keyType: unknown): JwkKeyType => {
  if (isJwkKeyType(keyType)) {
    return keyType;
  }

  throw new Error(`Unsupported JWK key type: ${keyType}`);
};
