import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { Sigalg } from './types';

/**
 * Converts a digest algorithm to its corresponding signature algorithm identifier.
 * @description
 * Maps MSO digest algorithms to their ECDSA signature algorithm equivalents
 * used in cryptographic operations. This conversion is commonly needed when
 * working with X.509 certificates and digital signatures.
 *
 * @param digestAlgorithm - The digest algorithm to convert
 * @returns The corresponding ECDSA signature algorithm identifier
 * @throws {Error} When an unsupported digest algorithm is provided
 *
 * @example
 * ```typescript
 * const sigalg = digestAlgorithmToSigalg('SHA-256');
 * console.log(sigalg); // 'SHA256withECDSA'
 * ```
 */
export const digestAlgorithmToSigalg = (
  digestAlgorithm: DigestAlgorithm
): Sigalg => {
  switch (digestAlgorithm) {
    case 'SHA-256':
      return 'SHA256withECDSA';
    case 'SHA-384':
      return 'SHA384withECDSA';
    case 'SHA-512':
      return 'SHA512withECDSA';
    default:
      throw new Error(`Unsupported digest algorithm: ${digestAlgorithm}`);
  }
};
