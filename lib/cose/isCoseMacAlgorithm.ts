import { MacAlgorithm } from './types';

/**
 * Checks if a given number is a valid COSE MAC algorithm.
 *
 * @param algorithm - The number to check
 * @returns True if the number is a valid COSE MAC algorithm, false otherwise
 */
export const isCoseMacAlgorithm = (
  algorithm: unknown
): algorithm is MacAlgorithm => {
  if (typeof algorithm !== 'number') {
    return false;
  }

  return Object.values(MacAlgorithm).includes(algorithm as MacAlgorithm);
};
