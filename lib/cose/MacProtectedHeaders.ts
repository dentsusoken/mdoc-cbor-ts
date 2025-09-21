import { ExactKeyMap, Es } from 'exact-key-map';
import { Headers, MacAlgorithms } from './types';

/**
 * Type definition for COSE MAC (Message Authentication Code) protected headers entries
 * @description
 * Defines the valid header label/value pairs allowed in COSE MAC protected headers.
 * Protected headers are integrity-protected and included in the MAC computation.
 *
 * The entries include:
 * - Algorithm: The MAC algorithm identifier (HS256, HS384, HS512)
 * - Critical: Array of header labels that must be understood by the recipient
 * - ContentType: Media type of the payload (number or binary)
 * - KeyID: Key identifier for the MAC key
 * - Additional headers: Other COSE header parameters with various value types
 *
 * @example
 * ```typescript
 * const headers = new MacProtectedHeaders();
 * headers.set(Headers.Algorithm, MacAlgorithms.HS256);
 * headers.set(Headers.KeyID, new Uint8Array([1, 2, 3, 4]));
 * ```
 *
 * @see Headers
 * @see MacAlgorithms
 */
export type MacProtectedHeadersEntries = Es<
  | [Headers.Algorithm, MacAlgorithms]
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
 * Strongly-typed map for COSE MAC protected headers.
 * @description
 * Provides type-safe accessors for COSE MAC protected header parameters. Values set here
 * are integrity-protected and included in the COSE MAC computation.
 *
 * @example
 * ```typescript
 * const headers = new MacProtectedHeaders();
 * headers.set(Headers.Algorithm, MacAlgorithms.HS256);
 * headers.set(Headers.Critical, [Headers.Algorithm]);
 * ```
 */
export class MacProtectedHeaders extends ExactKeyMap<MacProtectedHeadersEntries> {
  /**
   * Creates a new MAC protected headers map.
   * @param entries Optional initial entries as header label/value pairs.
   */
  constructor(entries?: MacProtectedHeadersEntries) {
    super(entries);
  }
}
