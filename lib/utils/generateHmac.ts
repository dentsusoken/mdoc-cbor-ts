import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { hmac } from '@noble/hashes/hmac';
import { getShaHash } from './getShaHash';

/**
 * Parameters for generating an HMAC.
 */
type GenerateHmacParams = {
  /** The digest algorithm to use. */
  digestAlgorithm: DigestAlgorithm;
  /** The secret key as a Uint8Array. */
  key: Uint8Array;
  /** The message to be authenticated as a Uint8Array. */
  message: Uint8Array;
};

/**
 * Generates an HMAC (Hash-based Message Authentication Code) for the given message using the specified digest algorithm and secret key.
 *
 * @param params - The parameters for HMAC generation.
 * @param params.digestAlgorithm - The digest algorithm to use (e.g., 'SHA-256').
 * @param params.key - The secret key as a Uint8Array.
 * @param params.message - The message to be authenticated as a Uint8Array.
 * @returns The generated HMAC as a Uint8Array.
 */
export const generateHmac = ({
  digestAlgorithm,
  key,
  message,
}: GenerateHmacParams): Uint8Array => {
  const hash = getShaHash(digestAlgorithm);

  return hmac(hash, key, message);
};
