import { ExactKeyMap, Es } from 'exact-key-map';
import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from './types';

/**
 * Type definition for COSE public key entries (EC and OKP).
 *
 * @description
 * Represents the possible key-value pairs that can be present in a COSE public key
 * following the COSE specification. Supports both EC (NIST curves) and OKP (EdDSA) keys.
 * Each entry is a tuple containing a key parameter identifier and its corresponding value type.
 *
 * @example
 * ```typescript
 * // Example EC public key entries
 * const keyEntries: PublicKeyEntries = [
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.Curve, Curves.P256],
 *   [KeyParams.Algorithm, Algorithms.ES256],
 *   [KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]],
 *   [KeyParams.x, new Uint8Array([...])], // x coordinate
 *   [KeyParams.y, new Uint8Array([...])], // y coordinate
 *   [KeyParams.KeyId, new Uint8Array([...])] // optional key identifier
 * ];
 *
 * // Example OKP (EdDSA) public key entries
 * const okpEntries: PublicKeyEntries = [
 *   [KeyParams.KeyType, KeyTypes.OKP],
 *   [KeyParams.Curve, Curves.Ed25519],
 *   [KeyParams.Algorithm, Algorithms.EdDSA],
 *   [KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]],
 *   [KeyParams.x, new Uint8Array([...])], // public key for OKP
 *   [KeyParams.KeyId, new Uint8Array([...])] // optional key identifier
 * ];
 * ```
 *
 * @see {@link KeyParams} - COSE key parameter identifiers
 * @see {@link KeyTypes} - COSE key types
 * @see {@link Curves} - COSE elliptic curves
 * @see {@link Algorithms} - COSE algorithms
 * @see {@link KeyOps} - COSE key operations
 */
export type PublicKeyEntries = Es<
  | [KeyParams.KeyType, KeyTypes]
  | [KeyParams.Curve, Curves]
  | [KeyParams.Algorithm, Algorithms]
  | [KeyParams.KeyOps, KeyOps[]]
  | [KeyParams.x, Uint8Array]
  | [KeyParams.y, Uint8Array]
  | [KeyParams.KeyId, Uint8Array]
>;

/**
 * A specialized Map for COSE public key parameters (EC and OKP) with exact key validation.
 *
 * @description
 * This class extends ExactKeyMap to provide type-safe handling of COSE public key
 * parameters. It ensures that only valid key parameter identifiers and their corresponding
 * value types can be stored in the map, following the COSE specification for EC (NIST)
 * and OKP (EdDSA) keys.
 *
 * The class supports common COSE public key parameters including:
 * - Key type (EC or OKP)
 * - Curve identifier (P-256, P-384, P-521, Ed25519, Ed448)
 * - Algorithm identifier (ES256/ES384/ES512, EdDSA)
 * - Key operations (Sign, Verify)
 * - Coordinate values (x, y) for EC; public key (x) for OKP
 * - Optional key identifier (KeyId)
 *
 * @example
 * ```typescript
 * import { PublicKey } from './PublicKey';
 * import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from './types';
 *
 * // Create an EC public key map
 * const ecKey = new PublicKey([
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.Curve, Curves.P256],
 *   [KeyParams.Algorithm, Algorithms.ES256],
 *   [KeyParams.x, new Uint8Array([...])],
 *   [KeyParams.y, new Uint8Array([...])]
 * ]);
 *
 * // Create an OKP (EdDSA) public key map
 * const okpKey = new PublicKey([
 *   [KeyParams.KeyType, KeyTypes.OKP],
 *   [KeyParams.Curve, Curves.Ed25519],
 *   [KeyParams.Algorithm, Algorithms.EdDSA],
 *   [KeyParams.x, new Uint8Array([...])]
 * ]);
 *
 * // Access key parameters
 * const keyType = ecKey.get(KeyParams.KeyType);
 * const curve = ecKey.get(KeyParams.Curve);
 * ```
 *
 * @see {@link PublicKeyEntries} - Type definition for valid key entries
 * @see {@link KeyParams} - COSE key parameter identifiers
 * @see {@link ExactKeyMap} - Base class providing exact key validation
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 */
export class PublicKey extends ExactKeyMap<PublicKeyEntries> {
  /**
   * Creates a new PublicKey instance.
   *
   * @param entries - Optional initial entries for the key map. Each entry is a tuple
   *                  of [KeyParams, value] where the value type must match the parameter.
   *
   * @example
   * ```typescript
   * // Create empty public key
   * const publicKey = new PublicKey();
   *
   * // Create with initial entries
   * const keyMapWithEntries = new PublicKey([
   *   [KeyParams.KeyType, KeyTypes.EC],
   *   [KeyParams.Curve, Curves.P256]
   * ]);
   * ```
   */
  constructor(entries?: PublicKeyEntries) {
    super(entries);
  }
}
