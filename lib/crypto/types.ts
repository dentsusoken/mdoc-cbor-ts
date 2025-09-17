/**
 * Signature algorithm identifiers for ECDSA with different hash functions
 * @description
 * Supported signature algorithms for ECDSA operations using SHA-2 hash functions.
 * These correspond to the algorithm identifiers used in cryptographic operations.
 */
export type Sigalg = 'SHA256withECDSA' | 'SHA384withECDSA' | 'SHA512withECDSA';

export type RandomBytes = (byteLength?: number) => Uint8Array;
