import { ExactKeyMap, Es } from 'exact-key-map';
import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from './types';

/**
 * Type definition for EC public key entries in COSE format.
 *
 * @description
 * Represents the possible key-value pairs that can be present in an EC public key
 * following the COSE specification. Each entry is a tuple containing a key parameter
 * identifier and its corresponding value type.
 *
 * @example
 * ```typescript
 * // Example EC public key entries
 * const keyEntries: EcPublicKeyEntries = [
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.Curve, Curves.P256],
 *   [KeyParams.Algorithm, Algorithms.ES256],
 *   [KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]],
 *   [KeyParams.x, new Uint8Array([...])], // x coordinate
 *   [KeyParams.y, new Uint8Array([...])], // y coordinate
 *   [KeyParams.KeyID, new Uint8Array([...])] // optional key identifier
 * ];
 * ```
 *
 * @see {@link KeyParams} - COSE key parameter identifiers
 * @see {@link KeyTypes} - COSE key types
 * @see {@link Curves} - COSE elliptic curves
 * @see {@link Algorithms} - COSE algorithms
 * @see {@link KeyOps} - COSE key operations
 */
export type EcPublicKeyEntries = Es<
  | [KeyParams.KeyType, KeyTypes]
  | [KeyParams.Curve, Curves]
  | [KeyParams.Algorithm, Algorithms]
  | [KeyParams.KeyOps, KeyOps[]]
  | [KeyParams.x, Uint8Array]
  | [KeyParams.y, Uint8Array]
  | [KeyParams.KeyID, Uint8Array]
>;

/**
 * A specialized Map for COSE EC public key parameters with exact key validation.
 *
 * @description
 * This class extends ExactKeyMap to provide type-safe handling of COSE EC public key
 * parameters. It ensures that only valid key parameter identifiers and their corresponding
 * value types can be stored in the map, following the COSE specification for EC keys.
 *
 * The class supports all standard COSE EC public key parameters including:
 * - Key type (must be EC)
 * - Elliptic curve identifier (P-256, P-384, P-521)
 * - Algorithm identifier (ES256, ES384, ES512)
 * - Key operations (Sign, Verify)
 * - Coordinate values (x, y)
 * - Optional key identifier
 *
 * @example
 * ```typescript
 * import { EcPublicKey } from './EcPublicKey';
 * import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from './types';
 *
 * // Create an empty EC public key map
 * const keyMap = new EcPublicKey();
 *
 * // Create with initial entries
 * const keyMapWithEntries = new EcPublicKey([
 *   [KeyParams.KeyType, KeyTypes.EC],
 *   [KeyParams.Curve, Curves.P256],
 *   [KeyParams.Algorithm, Algorithms.ES256],
 *   [KeyParams.x, new Uint8Array([...])],
 *   [KeyParams.y, new Uint8Array([...])]
 * ]);
 *
 * // Add key parameters
 * keyMap.set(KeyParams.KeyType, KeyTypes.EC);
 * keyMap.set(KeyParams.Curve, Curves.P256);
 * keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
 *
 * // Access key parameters
 * const keyType = keyMap.get(KeyParams.KeyType);
 * const curve = keyMap.get(KeyParams.Curve);
 * ```
 *
 * @see {@link EcPublicKeyEntries} - Type definition for valid key entries
 * @see {@link KeyParams} - COSE key parameter identifiers
 * @see {@link ExactKeyMap} - Base class providing exact key validation
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 */
export class EcPublicKey extends ExactKeyMap<EcPublicKeyEntries> {
  /**
   * Creates a new EcPublicKey instance.
   *
   * @param entries - Optional initial entries for the key map. Each entry is a tuple
   *                  of [KeyParams, value] where the value type must match the parameter.
   *
   * @example
   * ```typescript
   * // Create empty public key
   * const publicKey = new EcPublicKey();
   *
   * // Create with initial entries
   * const keyMapWithEntries = new EcPublicKey([
   *   [KeyParams.KeyType, KeyTypes.EC],
   *   [KeyParams.Curve, Curves.P256]
   * ]);
   * ```
   */
  constructor(entries?: EcPublicKeyEntries) {
    super(entries);
  }
}
