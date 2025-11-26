import { JwkKeyType, JwkCurve } from '@/jwk/types';
import { Curve, KeyType } from '@/cose/types';

/**
 * Mapping from COSE (CBOR Object Signing and Encryption) key type to JWK (JSON Web Key) key type.
 *
 * @description
 * This constant provides a direct mapping between COSE key type identifier and its corresponding
 * JWK key type identifier. COSE uses numeric identifier as defined in the IANA COSE Key Types registry
 * while JWK uses string-based key type name.
 *
 * @example
 * ```typescript
 * // Convert COSE key type to JWK key type
 * const jwkKeyType = COSE_TO_JWK_KEY_TYPE[KeyType.EC]; // Returns 'EC'
 *
 * // Use in JWK key construction
 * const jwk = {
 *   kty: COSE_TO_JWK_KEY_TYPE[KeyType.EC],
 *   // ...
 * };
 * ```
 *
 * @see {@link KeyType} - COSE key type numeric identifiers
 * @see {@link JwkKeyType} - JWK key type string identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const COSE_TO_JWK_KEY_TYPE: Record<KeyType, JwkKeyType> = {
  [KeyType.OKP]: JwkKeyType.OKP,
  [KeyType.EC]: JwkKeyType.EC,
  [KeyType.oct]: JwkKeyType.oct,
};

/**
 * Mapping from COSE (CBOR Object Signing and Encryption) curve to JWK (JSON Web Key) curve.
 *
 * @description
 * This constant provides a direct mapping between COSE curve identifier and its corresponding
 * JWK curve identifier. COSE uses numeric identifier as defined in the IANA COSE Elliptic Curves registry
 * while JWK uses string-based curve name.
 *
 * @example
 * ```typescript
 * // Convert COSE curve to JWK curve
 * const jwkCurve = COSE_TO_JWK_CURVE[Curve.P256]; // Returns 'P-256'
 *
 * // Use in JWK key construction
 * const jwk = {
 *   kty: 'EC',
 *   crv: COSE_TO_JWK_CURVE[Curve.P256],
 *   // ...
 * };
 * ```
 *
 * @see {@link Curve} - COSE curve numeric identifiers
 * @see {@link JwkCurve} - JWK curve string identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-6.2.1} - JWK curve specifications
 */
export const COSE_TO_JWK_CURVE: Record<Curve, JwkCurve> = {
  [Curve.P256]: JwkCurve.P256,
  [Curve.P384]: JwkCurve.P384,
  [Curve.P521]: JwkCurve.P521,
  [Curve.X25519]: JwkCurve.X25519,
  [Curve.X448]: JwkCurve.X448,
  [Curve.Ed25519]: JwkCurve.Ed25519,
  [Curve.Ed448]: JwkCurve.Ed448,
};
