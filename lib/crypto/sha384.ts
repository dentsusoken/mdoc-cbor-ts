import { KJUR } from 'jsrsasign';
import { decodeHex, encodeHex } from 'u8a-utils';

/**
 * Computes SHA-384 hash of the input data
 * @description
 * Uses jsrsasign's MessageDigest with CryptoJS provider to compute
 * the SHA-384 hash of the provided Uint8Array data.
 *
 * @param data - The input data to hash
 * @returns The SHA-384 hash as a Uint8Array
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode('hello world');
 * const hash = sha384(data);
 * console.log(encodeHex(hash)); // Outputs the hex representation
 * ```
 */
export const sha384 = (data: Uint8Array): Uint8Array => {
  const md = new KJUR.crypto.MessageDigest({
    alg: 'sha384',
    prov: 'cryptojs',
  });
  md.updateHex(encodeHex(data));

  const hex = md.digest();
  return decodeHex(hex);
};
