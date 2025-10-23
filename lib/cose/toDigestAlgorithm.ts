import { isDigestAlgorithm } from './isDigestAlgorithm';
import { DigestAlgorithm } from './types';

/**
 * Converts a string to a DigestAlgorithm enum value if valid.
 *
 * @param algorithm - The digest algorithm name as a string.
 * @returns The valid DigestAlgorithm corresponding to the input string.
 * @throws {Error} If the provided string is not a recognized DigestAlgorithm.
 *
 * @example
 * ```typescript
 * toDigestAlgorithm('SHA-256'); // returns DigestAlgorithm.SHA256
 * toDigestAlgorithm('invalid'); // throws Error: Invalid digest algorithm: invalid
 * ```
 */
export const toDigestAlgorithm = (algorithm: string): DigestAlgorithm => {
  if (isDigestAlgorithm(algorithm)) {
    return algorithm;
  }

  throw new Error(`Invalid digest algorithm: ${algorithm}`);
};
