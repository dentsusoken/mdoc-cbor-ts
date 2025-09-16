import { ExactKeyMap, Es } from 'exact-key-map';
import { Headers } from './types';

/**
 * Type definition for COSE unprotected headers entries
 * @description
 * Defines the valid header label/value pairs allowed in COSE unprotected headers.
 * Unprotected headers are not integrity-protected and are excluded from the signature computation.
 *
 * The entries include:
 * - ContentType: Media type of the payload (number or binary)
 * - KeyID: Key identifier
 * - IV: Initialization vector
 * - PartialIV: Partial initialization vector
 * - X5Chain: X.509 certificate chain (array of DER bytes)
 * - Additional headers: Other COSE header parameters with various value types
 *
 * @example
 * ```typescript
 * const headers = new UnprotectedHeaders();
 * headers.set(Headers.ContentType, 50);
 * headers.set(Headers.KeyID, new Uint8Array([1, 2, 3, 4]));
 * headers.set(Headers.IV, new Uint8Array(16));
 * ```
 *
 * @see Headers
 */
export type UnprotectedHeadersEntries = Es<
  | [Headers.ContentType, number | Uint8Array]
  | [Headers.KeyID, Uint8Array]
  | [Headers.IV, Uint8Array]
  | [Headers.PartialIV, Uint8Array]
  | [Headers.X5Chain, Uint8Array[]]
  | [
      Exclude<
        Headers,
        | Headers.ContentType
        | Headers.KeyID
        | Headers.IV
        | Headers.PartialIV
        | Headers.X5Chain
      >,
      number | number[] | Uint8Array | Uint8Array[],
    ]
>;

/**
 * Strongly-typed map for COSE unprotected headers.
 * @description
 * Provides type-safe accessors for COSE unprotected header parameters. Values set here
 * are not integrity-protected and are excluded from the COSE signature computation.
 *
 * @example
 * ```typescript
 * const headers = new UnprotectedHeaders();
 * headers.set(Headers.ContentType, 50);
 * headers.set(Headers.KeyID, new Uint8Array([1, 2]));
 * ```
 */
export class UnprotectedHeaders extends ExactKeyMap<UnprotectedHeadersEntries> {
  /**
   * Creates a new unprotected headers map.
   * @param entries Optional initial entries as header label/value pairs.
   */
  constructor(entries?: UnprotectedHeadersEntries) {
    super(entries);
  }
}
