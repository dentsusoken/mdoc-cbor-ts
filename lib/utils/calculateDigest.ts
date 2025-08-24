import { encodeCbor } from '@/cbor/codec';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';

/**
 * Calculates a digest of the provided data using the specified algorithm
 * @description
 * A utility function that calculates a cryptographic digest (hash) of any data
 * using the specified digest algorithm. The data is first encoded using CBOR before
 * calculating the digest. This function is commonly used in mdoc verification processes
 * to validate issuer-signed items and other CBOR-encoded data structures.
 *
 * @param algorithm - The digest algorithm to use (e.g., 'SHA-256', 'SHA-384', 'SHA-512')
 * @param data - Any data to calculate the digest for (will be CBOR encoded)
 * @returns A Promise that resolves to a Uint8Array containing the calculated digest
 *
 * @example
 * ```typescript
 * import { createTag24 } from '@/cbor';
 *
 * // Example with IssuerSignedItem structure
 * const issuerSignedItem = {
 *   digestID: 1,
 *   random: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]),
 *   elementIdentifier: 'given_name',
 *   elementValue: 'John'
 * };
 * const tag24 = createTag24(issuerSignedItem);
 * const digest = await calculateDigest('SHA-256', tag24);
 * console.log(digest); // Uint8Array containing the hash
 * ```
 */
export const calculateDigest = async (
  algorithm: DigestAlgorithm,
  data: unknown
): Promise<Uint8Array> => {
  const buffer = await crypto.subtle.digest(algorithm, encodeCbor(data));

  return new Uint8Array(buffer, 0, buffer.byteLength);
};
