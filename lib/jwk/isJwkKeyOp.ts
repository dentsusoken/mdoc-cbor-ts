import { JwkKeyOps } from './types';

/**
 * Checks if a given string is a valid JWK key operation.
 *
 * @param keyOp - The string to check
 * @returns True if the keyOps is a valid JwkKeyOps value, false otherwise
 */
export const isJwkKeyOp = (keyOp: unknown): keyOp is JwkKeyOps => {
  if (typeof keyOp !== 'string') {
    return false;
  }

  return Object.values(JwkKeyOps).includes(keyOp as JwkKeyOps);
};
