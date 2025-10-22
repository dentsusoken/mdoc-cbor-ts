import { encodeCbor } from '@/cbor/codec';
import { getShaHash } from './getShaHash';

/**
 * Calculates a cryptographic digest (hash) of the provided data using the specified digest algorithm.
 *
 * @description
 * Encodes the input data using CBOR and then computes its hash using the specified digest algorithm.
 * This function is typically used in mdoc verification processes to validate issuer-signed items
 * and other CBOR-encoded data structures.
 *
 * @param algorithm - The digest algorithm to use ('SHA-256', 'SHA-384', or 'SHA-512').
 * @param data - The data to be hashed. This can be any value that is CBOR-encodable.
 * @returns A Uint8Array containing the calculated digest.
 *
 * @example
 * ```typescript
 * import { createTag24 } from '@/cbor';
 *
 * const issuerSignedItem = {
 *   digestID: 1,
 *   random: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]),
 *   elementIdentifier: 'given_name',
 *   elementValue: 'John'
 * };
 * const tag24 = createTag24(issuerSignedItem);
 * const digest = calculateDigest('SHA-256', tag24);
 * console.log(digest); // Uint8Array containing the hash
 * ```
 */
export const calculateDigest = (
  algorithm: string,
  data: unknown
): Uint8Array => {
  const hash = getShaHash(algorithm);

  return hash(encodeCbor(data));
};
