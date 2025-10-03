import { DigestAlgorithm } from '@/schemas/mso';
import { sha256 } from '@noble/hashes/sha256';
import { sha384, sha512 } from '@noble/hashes/sha512';
import { CHash } from '@noble/hashes/utils';

/**
 * Returns the hash function corresponding to the specified digest algorithm.
 *
 * @param digestAlgorithm - The digest algorithm to use ('SHA-256', 'SHA-384', or 'SHA-512').
 * @returns The hash function (CHash) for the specified digest algorithm.
 * @throws {Error} If the provided digest algorithm is not supported.
 */
export const getShaHash = (digestAlgorithm: DigestAlgorithm): CHash => {
  switch (digestAlgorithm) {
    case 'SHA-256':
      return sha256;
    case 'SHA-384':
      return sha384;
    case 'SHA-512':
      return sha512;
    default:
      throw new Error(`Unsupported digest algorithm: ${digestAlgorithm}`);
  }
};
