import { KeyOps } from './types';
import { jwkToCoseKeyOp } from './jwkToCoseKeyOp';

/**
 * Converts an array of JWK key operations to an array of COSE key operations.
 *
 * @param jwkKeyOps - Array of JWK key operation strings to convert
 * @returns Array of corresponding COSE key operations
 * @throws {Error} When any of the provided keyOps is not a valid JWK key operation
 *
 * @example
 * ```typescript
 * const coseKeyOps = jwkToCoseKeyOps(['sign', 'verify']); // Returns array of COSE KeyOps values
 * const encryptOps = jwkToCoseKeyOps(['encrypt', 'decrypt']); // Returns array of COSE KeyOps values
 *
 * // Throws error for invalid key operations
 * jwkToCoseKeyOps(['sign', 'invalid-operation']); // Throws: Unsupported JWK key operation: invalid-operation
 * ```
 */
export const jwkToCoseKeyOps = (jwkKeyOps: string[]): KeyOps[] => {
  return jwkKeyOps.map((keyOp) => jwkToCoseKeyOp(keyOp));
};
