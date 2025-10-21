import { JwkKeyOp } from './types';

/**
 * Checks if a given string is a valid JWK key operation.
 *
 * @param keyOp - The string to check
 * @returns True if the keyOps is a valid JwkKeyOps value, false otherwise
 */
export const isJwkKeyOp = (keyOp: unknown): keyOp is JwkKeyOp => {
  if (typeof keyOp !== 'string') {
    return false;
  }

  return Object.values(JwkKeyOp).includes(keyOp as JwkKeyOp);
};
