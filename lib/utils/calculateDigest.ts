import crypto from 'crypto';
import { ByteString, encode } from '../cbor';
import { DigestAlgorithm } from '../schemas/mso';

/**
 * Calculates a digest of the provided data using the specified algorithm
 * @description
 * A utility function that calculates a cryptographic digest (hash) of the provided
 * ByteString data using the specified digest algorithm. The data is first encoded
 * using CBOR before calculating the digest.
 *
 * @param algorithm - The digest algorithm to use (e.g., 'SHA-256', 'SHA-384', 'SHA-512')
 * @param data - The ByteString data to calculate the digest for
 * @returns A Promise that resolves to a Buffer containing the calculated digest
 *
 * @example
 * ```typescript
 * const data = new ByteString({ key: 'value' });
 * const digest = await calculateDigest('SHA-256', data);
 * ```
 */
export const calculateDigest = async (
  algorithm: DigestAlgorithm,
  data: ByteString
): Promise<Buffer> => {
  return Buffer.from(await crypto.subtle.digest(algorithm, encode(data)));
};
