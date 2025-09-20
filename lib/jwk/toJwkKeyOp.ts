import { isJwkKeyOp } from './isJwkKeyOp';
import { JwkKeyOps } from './types';

/**
 * Converts a string to a valid JWK key operation.
 *
 * @param keyOp - The string to convert to a JWK key operation
 * @returns The validated JWK key operation
 * @throws {Error} When the provided keyOp is not a valid JWK key operation
 *
 * @example
 * ```typescript
 * const keyOp = toJwkKeyOp('sign'); // Returns JwkKeyOps.Sign
 * const verifyOp = toJwkKeyOp('verify'); // Returns JwkKeyOps.Verify
 *
 * // Throws error for invalid key operations
 * toJwkKeyOp('invalid-operation'); // Throws: Unsupported JWK key operation: invalid-operation
 * ```
 */
export const toJwkKeyOp = (keyOp: string): JwkKeyOps => {
  if (isJwkKeyOp(keyOp)) {
    return keyOp;
  }

  throw new Error(`Unsupported JWK key operation: ${keyOp}`);
};
