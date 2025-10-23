import { DigestAlgorithm } from './types';

/**
 * Checks if the input string is a valid DigestAlgorithm.
 *
 * @param algorithm - The algorithm name as a string.
 * @returns True if the string is a recognized DigestAlgorithm enum value, false otherwise.
 */
export const isDigestAlgorithm = (
  algorithm: string
): algorithm is DigestAlgorithm => {
  return Object.values(DigestAlgorithm).includes(algorithm as DigestAlgorithm);
};
