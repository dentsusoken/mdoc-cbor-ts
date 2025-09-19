import {
  JwkKeyOps,
  JwkKeyParams,
  JwkKeyTypes,
  JwkMacKeyOps,
  JwkAlgorithms,
  JwkCurves,
} from '@/jwk/types';
import { Algorithms, Curves, KeyOps, KeyParams, KeyTypes } from './types';

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
 * @see {@link JwkAlgorithms} - JWK algorithm string identifiers
 * @see {@link Algorithms} - COSE algorithm numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms} - IANA COSE Algorithms registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-3.1} - JWS algorithm specifications
 * @see {@link https://tools.ietf.org/html/rfc7518#section-4.1} - JWE algorithm specifications
 */
export const JWK_TO_COSE_ALGORITHMS: Record<JwkAlgorithms, Algorithms> = {
  [JwkAlgorithms.EdDSA]: Algorithms.EdDSA,
  [JwkAlgorithms.ES256]: Algorithms.ES256,
  [JwkAlgorithms.ES384]: Algorithms.ES384,
  [JwkAlgorithms.ES512]: Algorithms.ES512,
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
 * @see {@link JwkKeyTypes} - JWK key type string identifiers
 * @see {@link KeyTypes} - COSE key type numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const JWK_TO_COSE_KEY_TYPES: Record<JwkKeyTypes, KeyTypes> = {
  [JwkKeyTypes.OKP]: KeyTypes.OKP,
  [JwkKeyTypes.EC]: KeyTypes.EC,
  [JwkKeyTypes.oct]: KeyTypes.oct,
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
 * @see {@link JwkCurves} - JWK curve string identifiers
 * @see {@link Curves} - COSE curve numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#elliptic-curves} - IANA COSE Elliptic Curves registry
 * @see {@link https://tools.ietf.org/html/rfc7518#section-6.2.1} - JWK curve specifications
 */
export const JWK_TO_COSE_CURVES: Record<JwkCurves, Curves> = {
  [JwkCurves.P256]: Curves.P256,
  [JwkCurves.P384]: Curves.P384,
  [JwkCurves.P521]: Curves.P521,
  [JwkCurves.Ed25519]: Curves.Ed25519,
  [JwkCurves.Ed448]: Curves.Ed448,
  [JwkCurves.X25519]: Curves.X25519,
  [JwkCurves.X448]: Curves.X448,
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
 * @see {@link JwkKeyParams} - JWK key parameter string identifiers
 * @see {@link KeyParams} - COSE key parameter numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common-parameters} - IANA COSE Key Common Parameters registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4} - JWK key parameter specifications
 */
export const JWK_TO_COSE_KEY_PARAMS: Record<JwkKeyParams, KeyParams> = {
  [JwkKeyParams.KeyType]: KeyParams.KeyType,
  [JwkKeyParams.KeyID]: KeyParams.KeyID,
  [JwkKeyParams.Algorithm]: KeyParams.Algorithm,
  [JwkKeyParams.KeyOps]: KeyParams.KeyOps,
  [JwkKeyParams.Curve]: KeyParams.Curve,
  [JwkKeyParams.x]: KeyParams.x,
  [JwkKeyParams.y]: KeyParams.y,
  [JwkKeyParams.d]: KeyParams.d,
  [JwkKeyParams.k]: KeyParams.k,
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
 * @see {@link JwkKeyOps} - JWK key operation string identifiers
 * @see {@link KeyOps} - COSE key operation numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-ops} - IANA COSE Key Operations registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.3} - JWK key operations specifications
 */
export const JWK_TO_COSE_KEY_OPS: Record<JwkKeyOps, KeyOps> = {
  [JwkKeyOps.Sign]: KeyOps.Sign,
  [JwkKeyOps.Verify]: KeyOps.Verify,
  [JwkKeyOps.Encrypt]: KeyOps.Encrypt,
  [JwkKeyOps.Decrypt]: KeyOps.Decrypt,
  [JwkKeyOps.WrapKey]: KeyOps.WrapKey,
  [JwkKeyOps.UnwrapKey]: KeyOps.UnwrapKey,
  [JwkKeyOps.DeriveKey]: KeyOps.DeriveKey,
  [JwkKeyOps.DeriveBits]: KeyOps.DeriveBits,
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
 * @see {@link JwkMacKeyOps} - JWK MAC operation string identifiers
 * @see {@link KeyOps} - COSE key operation numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-ops} - IANA COSE Key Operations registry
 */
export const JWK_TO_COSE_MAC_KEY_OPS: Record<JwkMacKeyOps, KeyOps> = {
  [JwkMacKeyOps.MACCreate]: KeyOps.MACCreate,
  [JwkMacKeyOps.MACVerify]: KeyOps.MACVerify,
};
