/**
 * Signature algorithm identifiers for ECDSA with different hash functions
 * @description
 * Supported signature algorithms for ECDSA operations using SHA-2 hash functions.
 * These correspond to the algorithm identifiers used in cryptographic operations.
 */
export type Sigalg = 'SHA256withECDSA' | 'SHA384withECDSA' | 'SHA512withECDSA';

/**
 * Function type for generating cryptographically secure random bytes
 * @description
 * A function that generates a specified number of cryptographically secure random bytes.
 * Used for initializing pseudo-random number generators and other cryptographic operations
 * that require high-quality entropy.
 *
 * @param byteLength - The number of random bytes to generate (defaults to 32 if not specified)
 * @returns A Uint8Array containing the requested number of random bytes
 *
 * @example
 * ```typescript
 * const randomBytes: RandomBytes = (length = 32) => {
 *   const buffer = new Uint8Array(length);
 *   crypto.getRandomValues(buffer);
 *   return buffer;
 * };
 * ```
 */
export type RandomBytes = (byteLength?: number) => Uint8Array;
