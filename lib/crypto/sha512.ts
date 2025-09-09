import { KJUR } from 'jsrsasign';
import { decodeHex, encodeHex } from 'u8a-utils';

/**
 * Computes SHA-512 hash of the input data
 * @description
 * Uses jsrsasign's MessageDigest with CryptoJS provider to compute
 * the SHA-512 hash of the provided Uint8Array data.
 *
 * @param data - The input data to hash
 * @returns The SHA-512 hash as a Uint8Array
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode('hello world');
 * const hash = sha512(data);
 * console.log(encodeHex(hash)); // Outputs the hex representation
 * ```
 */
export const sha512 = (data: Uint8Array): Uint8Array => {
  const md = new KJUR.crypto.MessageDigest({
    alg: 'sha512',
    prov: 'cryptojs',
  });
  md.updateHex(encodeHex(data));

  const hex = md.digest();
  return decodeHex(hex);
};
