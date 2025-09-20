import { KeyOps } from './types';
import { JWK_TO_COSE_KEY_OPS } from './constants';
import { toJwkKeyOp } from '@/jwk/toJwkKeyOp';

/**
 * Converts a JWK key operation to a COSE key operation.
 *
 * @param keyOp - The JWK key operation string to convert
 * @returns The corresponding COSE key operation
 * @throws {Error} When the provided keyOp is not a valid JWK key operation
 *
 * @example
 * ```typescript
 * const coseKeyOp = jwkToCoseKeyOp('sign'); // Returns corresponding COSE KeyOps value
 * const verifyOp = jwkToCoseKeyOp('verify'); // Returns corresponding COSE KeyOps value
 *
 * // Throws error for invalid key operations
 * jwkToCoseKeyOp('invalid-operation'); // Throws: Unsupported JWK key operation: invalid-operation
 * ```
 */
export const jwkToCoseKeyOp = (keyOp: string): KeyOps => {
  return JWK_TO_COSE_KEY_OPS[toJwkKeyOp(keyOp)];
};
