import type { JwkObject } from 'jsrsasign';

/**
 * Base type for EC JWK objects extracted from jsrsasign's JwkObject
 */
type ECBaseJwk = Extract<JwkObject, { kty: 'EC' }>;

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
  Extract<ECBaseJwk, { x: string; y: string }>,
  'crv' | 'd'
> & {
  kty: 'EC';
  crv: 'P-256' | 'P-384' | 'P-521';
  x: string;
  y: string;
  kid?: string;
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
export type ECPrivateJwk = Omit<Extract<ECBaseJwk, { d: string }>, 'crv'> & {
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
 * JWK (JSON Web Key) curve names
 * Reference: https://tools.ietf.org/html/rfc7518#section-6.2.1
 */
export enum JwkCurves {
  P256 = 'P-256',
  P384 = 'P-384',
  P521 = 'P-521',
  Ed25519 = 'Ed25519',
  Ed448 = 'Ed448',
  X25519 = 'X25519',
  X448 = 'X448',
}
