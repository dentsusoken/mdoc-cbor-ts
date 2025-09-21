import { ExactKeyMap, Es } from 'exact-key-map';
import { Headers, Algorithms } from './types';

/**
 * Type definition for COSE protected headers entries
 * @description
 * Defines the valid header label/value pairs allowed in COSE protected headers.
 * Protected headers are integrity-protected and included in the signature computation.
 *
 * The entries include:
 * - Algorithm: The cryptographic algorithm identifier
 * - Critical: Array of header labels that must be understood by the recipient
 * - ContentType: Media type of the payload (number or binary)
 * - KeyID: Key identifier for the signing/verification key
 * - Additional headers: Other COSE header parameters with various value types
 *
 * @example
 * ```typescript
 * const headers = new ProtectedHeaders();
 * headers.set(Headers.Algorithm, Algorithms.ES256);
 * headers.set(Headers.KeyID, new Uint8Array([1, 2, 3, 4]));
 * ```
 *
 * @see Headers
 * @see Algorithms
 */
export type ProtectedHeadersEntries = Es<
  | [Headers.Algorithm, Algorithms]
  | [Headers.Critical, Headers[]]
  | [Headers.ContentType, number | Uint8Array]
  | [Headers.KeyId, Uint8Array]
  | [
      Exclude<
        Headers,
        | Headers.Algorithm
        | Headers.Critical
        | Headers.ContentType
        | Headers.KeyId
      >,
      Uint8Array | Uint8Array[] | number | number[],
    ]
>;

/**
 * Strongly-typed map for COSE protected headers.
 * @description
 * Provides type-safe accessors for COSE protected header parameters. Values set here
 * are integrity-protected and included in the COSE signature computation.
 *
 * @example
 * ```typescript
 * const headers = new ProtectedHeaders();
 * headers.set(Headers.Algorithm, Algorithms.ES256);
 * headers.set(Headers.Critical, [Headers.Algorithm]);
 * ```
 */
export class ProtectedHeaders extends ExactKeyMap<ProtectedHeadersEntries> {
  /**
   * Creates a new protected headers map.
   * @param entries Optional initial entries as header label/value pairs.
   */
  constructor(entries?: ProtectedHeadersEntries) {
    super(entries);
  }
}
