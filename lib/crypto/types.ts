import type { JwkObject } from 'jsrsasign';

/**
 * Base type for EC JWK objects extracted from jsrsasign's JwkObject
 */
type ECBase = Extract<JwkObject, { kty: 'EC' }>;

/**
 * Elliptic Curve public key in JSON Web Key (JWK) format
 * @description
 * Represents an EC public key with required coordinates (x, y) and supported curves.
 * Based on RFC 7517 and RFC 7518 specifications for JWK format.
 *
 * @example
 * ```typescript
 * const publicKey: ECPublicJWK = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   x: 'base64url-encoded-x-coordinate',
 *   y: 'base64url-encoded-y-coordinate'
 * };
 * ```
 */
export type ECPublicJwk = Omit<
  Extract<ECBase, { x: string; y: string }>,
  'crv' | 'd'
> & {
  kty: 'EC';
  crv: 'P-256' | 'P-384' | 'P-521';
  x: string;
  y: string;
} & { [prop: string]: unknown };

/**
 * Elliptic Curve private key in JSON Web Key (JWK) format
 * @description
 * Represents an EC private key with the private key component (d) and supported curves.
 * Based on RFC 7517 and RFC 7518 specifications for JWK format.
 *
 * @example
 * ```typescript
 * const privateKey: ECPrivateJWK = {
 *   kty: 'EC',
 *   crv: 'P-256',
 *   d: 'base64url-encoded-private-key'
 * };
 * ```
 */
export type ECPrivateJwk = Omit<Extract<ECBase, { d: string }>, 'crv'> & {
  kty: 'EC';
  crv: 'P-256' | 'P-384' | 'P-521';
  d: string;
} & { [prop: string]: unknown };

/**
 * Union type for EC JWK keys (public or private)
 * @description
 * Represents either an EC public key or EC private key in JWK format.
 */
export type ECJwk = ECPublicJwk | ECPrivateJwk;

/**
 * Signature algorithm identifiers for ECDSA with different hash functions
 * @description
 * Supported signature algorithms for ECDSA operations using SHA-2 hash functions.
 * These correspond to the algorithm identifiers used in cryptographic operations.
 */
export type Sigalg = 'SHA256withECDSA' | 'SHA384withECDSA' | 'SHA512withECDSA';

export type RandomBytes = (byteLength?: number) => Uint8Array;
