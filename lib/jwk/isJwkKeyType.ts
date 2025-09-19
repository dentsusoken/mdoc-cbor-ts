import { JwkKeyTypes } from './types';

/**
 * Checks if a given string is a valid JWK key type.
 *
 * @param keyType - The string to check
 * @returns True if the keyType is a valid JwkKeyTypes value, false otherwise
 */
export const isJwkKeyType = (keyType: string): keyType is JwkKeyTypes => {
  return Object.values(JwkKeyTypes).includes(keyType as JwkKeyTypes);
};
