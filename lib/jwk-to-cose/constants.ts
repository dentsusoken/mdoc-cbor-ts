import { JwkKeyType, JwkAlgorithm, JwkCurve } from '@/jwk/types';
import { Algorithm, Curve, KeyType } from '@/cose/types';

/**
 * Mapping from JWK (JSON Web Key) key type to COSE (CBOR Object Signing and Encryption) key type.
 *
 * @description
 * This constant provides a direct mapping between JWK key type identifier and its corresponding
 * COSE key type identifier. JWK uses string-based key type name while COSE uses numeric identifier
 * as defined in the IANA COSE Key Types registry.
 *
 * @example
 * ```typescript
 * // Convert JWK key type to COSE key type
 * const coseKeyType = JWK_TO_COSE_KEY_TYPE[JwkKeyType.EC]; // Returns 2
 *
 * // Use in COSE key construction
 * const coseKey = new Map([[1, JWK_TO_COSE_KEY_TYPE[JwkKeyType.EC]]]); // kty parameter
 * ```
 *
 * @see {@link JwkKeyType} - JWK key type string identifiers
 * @see {@link KeyType} - COSE key type numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const JWK_TO_COSE_KEY_TYPE: Record<string, number> = {
  [JwkKeyType.OKP]: KeyType.OKP,
  [JwkKeyType.EC]: KeyType.EC,
  [JwkKeyType.oct]: KeyType.oct,
};

/**
 * Mapping from JWK (JSON Web Key) curve to COSE (CBOR Object Signing and Encryption) curve.
 *
 * @description
 * This constant provides a direct mapping between JWK curve identifier and its corresponding
 * COSE curve identifier. JWK uses string-based curve name while COSE uses numeric identifier
 * as defined in the IANA COSE Elliptic Curves registry.
 *
 * @example
 * ```typescript
 * // Convert JWK curve to COSE curve
 * const coseCurve = JWK_TO_COSE_CURVE[JwkCurve.P256]; // Returns 1
 *
 * // Use in COSE key construction
 * const coseKey = new Map([
 *   [Key.KeyType, KeyType.EC],
 *   [Key.Curve, JWK_TO_COSE_CURVE[JwkCurve.P256]]
 * ]);
 * ```
 *
 * @see {@link JwkCurve} - JWK curve string identifiers
 * @see {@link Curve} - COSE curve numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-6.2.1} - JWK curve specifications
 */
export const JWK_TO_COSE_CURVE: Record<string, number> = {
  [JwkCurve.P256]: Curve.P256,
  [JwkCurve.P384]: Curve.P384,
  [JwkCurve.P521]: Curve.P521,
  [JwkCurve.X25519]: Curve.X25519,
  [JwkCurve.X448]: Curve.X448,
  [JwkCurve.Ed25519]: Curve.Ed25519,
  [JwkCurve.Ed448]: Curve.Ed448,
};
