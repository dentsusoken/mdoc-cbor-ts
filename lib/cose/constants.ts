import {
  JwkKeyOp,
  JwkKey,
  JwkKeyType,
  JwkMacKeyOp,
  JwkAlgorithm,
  JwkCurve,
  JwkMacAlgorithm,
} from '@/jwk/types';
import { Algorithm, Curve, KeyOp, Key, KeyType, MacAlgorithm } from './types';

/**
 * Mapping from JWK (JSON Web Key) algorithms to COSE (CBOR Object Signing and Encryption) algorithms.
 *
 * @description
 * This constant provides a direct mapping between JWK algorithm identifiers and their corresponding
 * COSE algorithm identifiers. JWK uses string-based algorithm names while COSE uses numeric identifiers
 * as defined in the IANA COSE Algorithms registry. This mapping covers both JWS and JWE algorithms.
 *
 * @example
 * ```typescript
 * // Convert JWK algorithm to COSE algorithm
 * const coseAlg = JWK_TO_COSE_ALGORITHMS[JwkAlgorithms.ES256]; // Returns -7
 *
 * // Use in COSE header construction
 * const protectedHeaders = new Map([[Headers.Algorithm, JWK_TO_COSE_ALGORITHMS[JwkAlgorithms.ES256]]]);
 * ```
 *
 * @see {@link JwkAlgorithm} - JWK algorithm string identifiers
 * @see {@link Algorithm} - COSE algorithm numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-3.1} - JWS algorithm specifications
 * @see {@link https://tools.ietf.org/html/rfc7518#section-4.1} - JWE algorithm specifications
 */
export const JWK_TO_COSE_ALGORITHMS: Record<JwkAlgorithm, Algorithm> = {
  [JwkAlgorithm.EdDSA]: Algorithm.EdDSA,
  [JwkAlgorithm.ES256]: Algorithm.ES256,
  [JwkAlgorithm.ES384]: Algorithm.ES384,
  [JwkAlgorithm.ES512]: Algorithm.ES512,
};

/**
 * Mapping from JWK (JSON Web Key) key types to COSE (CBOR Object Signing and Encryption) key types.
 *
 * @description
 * This constant provides a direct mapping between JWK key type identifiers and their corresponding
 * COSE key type identifiers. JWK uses string-based key type names while COSE uses numeric identifiers
 * as defined in the IANA COSE Key Types registry.
 *
 * @example
 * ```typescript
 * // Convert JWK key type to COSE key type
 * const coseKeyType = JWK_TO_COSE_KEY_TYPES[JwkKeyTypes.EC]; // Returns 2
 *
 * // Use in COSE key construction
 * const coseKey = new Map([[1, JWK_TO_COSE_KEY_TYPES[JwkKeyTypes.EC]]]); // kty parameter
 * ```
 *
 * @see {@link JwkKeyType} - JWK key type string identifiers
 * @see {@link KeyType} - COSE key type numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const JWK_TO_COSE_KEY_TYPES: Record<JwkKeyType, KeyType> = {
  [JwkKeyType.OKP]: KeyType.OKP,
  [JwkKeyType.EC]: KeyType.EC,
  [JwkKeyType.oct]: KeyType.oct,
};

/**
 * Mapping from JWK (JSON Web Key) curves to COSE (CBOR Object Signing and Encryption) curves.
 *
 * @description
 * This constant provides a direct mapping between JWK curve identifiers and their corresponding
 * COSE curve identifiers. JWK uses string-based curve names while COSE uses numeric identifiers
 * as defined in the IANA COSE Elliptic Curves registry.
 *
 * @example
 * ```typescript
 * // Convert JWK curve to COSE curve
 * const coseCurve = JWK_TO_COSE_CURVES[JwkCurves.P256]; // Returns 1
 *
 * // Use in COSE key construction
 * const coseKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.Curve, JWK_TO_COSE_CURVES[JwkCurves.P256]]
 * ]);
 * ```
 *
 * @see {@link JwkCurve} - JWK curve string identifiers
 * @see {@link Curve} - COSE curve numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-6.2.1} - JWK curve specifications
 */
export const JWK_TO_COSE_CURVES: Record<JwkCurve, Curve> = {
  [JwkCurve.P256]: Curve.P256,
  [JwkCurve.P384]: Curve.P384,
  [JwkCurve.P521]: Curve.P521,
  [JwkCurve.X25519]: Curve.X25519,
  [JwkCurve.X448]: Curve.X448,
  [JwkCurve.Ed25519]: Curve.Ed25519,
  [JwkCurve.Ed448]: Curve.Ed448,
};

/**
 * Mapping from JWK (JSON Web Key) key parameters to COSE (CBOR Object Signing and Encryption) key parameters.
 *
 * @description
 * This constant provides a direct mapping between JWK key parameter identifiers and their corresponding
 * COSE key parameter identifiers. JWK uses string-based parameter names while COSE uses numeric identifiers
 * as defined in the IANA COSE Key Common Parameters registry.
 *
 * @example
 * ```typescript
 * // Convert JWK key parameter to COSE key parameter
 * const coseParam = JWK_TO_COSE_KEY_PARAMS[JwkKeyParams.KeyType]; // Returns 1
 *
 * // Use in COSE key construction
 * const coseKey = new Map([
 *   [JWK_TO_COSE_KEY_PARAMS[JwkKeyParams.KeyType], KeyTypes.EC],
 *   [JWK_TO_COSE_KEY_PARAMS[JwkKeyParams.Curve], Curves.P256]
 * ]);
 * ```
 *
 * @see {@link JwkKey} - JWK key parameter string identifiers
 * @see {@link Key} - COSE key parameter numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common-parameters} - IANA COSE Key Common Parameters registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4} - JWK key parameter specifications
 */
export const JWK_TO_COSE_KEY_PARAMS: Record<JwkKey, Key> = {
  [JwkKey.KeyType]: Key.KeyType,
  [JwkKey.KeyID]: Key.KeyId,
  [JwkKey.Algorithm]: Key.Algorithm,
  [JwkKey.KeyOps]: Key.KeyOps,
  [JwkKey.Curve]: Key.Curve,
  [JwkKey.x]: Key.x,
  [JwkKey.y]: Key.y,
  [JwkKey.d]: Key.d,
  [JwkKey.k]: Key.k,
};

/**
 * Mapping from JWK (JSON Web Key) key operations to COSE (CBOR Object Signing and Encryption) key operations.
 *
 * @description
 * This constant provides a direct mapping between JWK key operation identifiers and their corresponding
 * COSE key operation identifiers. JWK uses string-based operation names while COSE uses numeric identifiers
 * as defined in the IANA COSE Key Operations registry.
 *
 * @example
 * ```typescript
 * // Convert JWK key operation to COSE key operation
 * const coseOp = JWK_TO_COSE_KEY_OPS[JwkKeyOps.Sign]; // Returns 1
 *
 * // Convert array of JWK operations to COSE operations
 * const jwkOps = [JwkKeyOps.Sign, JwkKeyOps.Verify];
 * const coseOps = jwkOps.map(op => JWK_TO_COSE_KEY_OPS[op]);
 *
 * // Use in COSE key construction
 * const coseKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.KeyOps, [JWK_TO_COSE_KEY_OPS[JwkKeyOps.Sign]]]
 * ]);
 * ```
 *
 * @see {@link JwkKeyOp} - JWK key operation string identifiers
 * @see {@link KeyOp} - COSE key operation numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-ops} - IANA COSE Key Operations registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.3} - JWK key operations specifications
 */
export const JWK_TO_COSE_KEY_OPS: Record<JwkKeyOp, KeyOp> = {
  [JwkKeyOp.Sign]: KeyOp.Sign,
  [JwkKeyOp.Verify]: KeyOp.Verify,
  [JwkKeyOp.Encrypt]: KeyOp.Encrypt,
  [JwkKeyOp.Decrypt]: KeyOp.Decrypt,
  [JwkKeyOp.WrapKey]: KeyOp.WrapKey,
  [JwkKeyOp.UnwrapKey]: KeyOp.UnwrapKey,
  [JwkKeyOp.DeriveKey]: KeyOp.DeriveKey,
  [JwkKeyOp.DeriveBits]: KeyOp.DeriveBits,
};

/**
 * Mapping from JWK (JSON Web Key) MAC operations to COSE (CBOR Object Signing and Encryption) MAC operations.
 *
 * @description
 * This constant provides a direct mapping between JWK MAC operation identifiers and their corresponding
 * COSE MAC operation identifiers. In JWK, MAC operations use the same string identifiers as signature
 * operations ('sign' and 'verify'), but COSE has dedicated numeric identifiers for MAC operations
 * (MACCreate and MACVerify) to distinguish them from signature operations.
 *
 * @example
 * ```typescript
 * // Convert JWK MAC operation to COSE MAC operation
 * const coseMacOp = JWK_TO_COSE_MAC_KEY_OPS[JwkMacKeyOps.MACCreate]; // Returns 9
 *
 * // Use in COSE symmetric key construction
 * const macKey = new Map([
 *   [KeyParams.KeyType, KeyTypes.OCT],
 *   [KeyParams.KeyOps, [
 *     JWK_TO_COSE_MAC_KEY_OPS[JwkMacKeyOps.MACCreate],
 *     JWK_TO_COSE_MAC_KEY_OPS[JwkMacKeyOps.MACVerify]
 *   ]],
 *   [KeyParams.k, symmetricKeyBytes]
 * ]);
 * ```
 *
 * @see {@link JwkMacKeyOp} - JWK MAC operation string identifiers
 * @see {@link KeyOp} - COSE key operation numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-ops} - IANA COSE Key Operations registry
 */
export const JWK_TO_COSE_MAC_KEY_OPS: Record<JwkMacKeyOp, KeyOp> = {
  [JwkMacKeyOp.MACCreate]: KeyOp.MACCreate,
  [JwkMacKeyOp.MACVerify]: KeyOp.MACVerify,
};

/**
 * Mapping from COSE elliptic curves to their corresponding signature algorithms.
 *
 * @description
 * This constant provides a direct mapping between COSE elliptic curve identifiers and their
 * corresponding signature algorithm identifiers. This mapping is useful for determining
 * which signature algorithm should be used with a specific elliptic curve in COSE operations.
 *
 * The mapping follows these conventions:
 * - NIST P-curves (P-256, P-384, P-521) map to their corresponding ECDSA algorithms
 * - Edwards curves (Ed25519, Ed448) map to the EdDSA algorithm
 *
 * @example
 * ```typescript
 * // Get algorithm for a specific curve
 * const algorithm = CURVES_TO_ALGORITHMS[Curves.P256]; // Returns Algorithms.ES256
 * const edAlgorithm = CURVES_TO_ALGORITHMS[Curves.Ed25519]; // Returns Algorithms.EdDSA
 *
 * // Use in COSE key validation
 * const validateKeyAlgorithm = (curve: Curves, algorithm: Algorithms): boolean => {
 *   return CURVES_TO_ALGORITHMS[curve] === algorithm;
 * };
 *
 * // Automatic algorithm selection based on curve
 * const selectAlgorithm = (curve: Curves): Algorithms => {
 *   return CURVES_TO_ALGORITHMS[curve];
 * };
 * ```
 *
 * @see {@link Curve} - COSE elliptic curve identifiers
 * @see {@link Algorithm} - COSE signature algorithm identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 */
export const CURVES_TO_ALGORITHMS: Record<Curve, Algorithm> = {
  [Curve.P256]: Algorithm.ES256,
  [Curve.P384]: Algorithm.ES384,
  [Curve.P521]: Algorithm.ES512,
  [Curve.X25519]: Algorithm.ECDH_ES_HKDF_256,
  [Curve.X448]: Algorithm.ECDH_ES_HKDF_512,
  [Curve.Ed25519]: Algorithm.EdDSA,
  [Curve.Ed448]: Algorithm.EdDSA,
};

/**
 * Mapping from COSE MAC algorithms to their corresponding digest algorithms.
 */
export const MAC_ALGORITHM_TO_DIGEST_ALGORITHM: Record<MacAlgorithm, string> = {
  [MacAlgorithm.HS256]: 'SHA-256',
  [MacAlgorithm.HS384]: 'SHA-384',
  [MacAlgorithm.HS512]: 'SHA-512',
};

/**
 * Mapping from JWK MAC algorithms to their corresponding digest algorithms.
 */
export const JWK_MAC_ALGORITHM_TO_DIGEST_ALGORITHM: Record<
  JwkMacAlgorithm,
  string
> = {
  [JwkMacAlgorithm.HS256]: 'SHA-256',
  [JwkMacAlgorithm.HS384]: 'SHA-384',
  [JwkMacAlgorithm.HS512]: 'SHA-512',
};

/**
 * Mapping from COSE MAC algorithms to their corresponding JWK MAC algorithms.
 */
export const MAC_ALGORITHM_TO_JWK_ALGORITHM: Record<
  MacAlgorithm,
  JwkMacAlgorithm
> = {
  [MacAlgorithm.HS256]: JwkMacAlgorithm.HS256,
  [MacAlgorithm.HS384]: JwkMacAlgorithm.HS384,
  [MacAlgorithm.HS512]: JwkMacAlgorithm.HS512,
};
