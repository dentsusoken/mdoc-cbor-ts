import { decodeCbor } from '@/cbor/codec';

/**
 * Base class for COSE (CBOR Object Signing and Encryption) structures.
 *
 * @description
 * Provides common functionality for handling COSE protected and unprotected headers,
 * including X.509 certificate chain extraction and verification.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8152 | RFC 8152 - COSE}
 *
 * @example
 * ```typescript
 * // Typically extended by COSE-specific classes like Sign1
 * class Sign1 extends CoseBase {
 *   // ... specific implementation
 * }
 * ```
 */
export class CoseBase {
  /**
   * CBOR-encoded protected headers.
   *
   * @description
   * Raw byte string (bstr) representation of the protected headers.
   * Use {@link decodedProtectedHeaders} to access the decoded values.
   */
  readonly protectedHeaders: Uint8Array;

  /**
   * Unprotected headers as a Map.
   *
   * @description
   * Contains headers that are not integrity-protected.
   * Keys are COSE header labels (integers), values are header-specific types.
   */
  readonly unprotectedHeaders: Map<number, unknown>;

  /**
   * Decoded protected headers as a Map.
   *
   * @description
   * Automatically decoded from {@link protectedHeaders} during construction.
   * Keys are COSE header labels (integers), values are header-specific types.
   */
  readonly decodedProtectedHeaders: Map<number, unknown>;

  /**
   * Creates a new CoseBase instance.
   *
   * @param protectedHeaders - CBOR-encoded protected headers (bstr)
   * @param unprotectedHeaders - Unprotected headers as a Map
   *
   * @description
   * Automatically decodes the protected headers for convenient access via
   * {@link decodedProtectedHeaders}.
   *
   * @example
   * ```typescript
   * const coseBase = new CoseBase(
   *   protectedHeadersBytes,
   *   new Map([[1, -7]]) // algorithm ES256
   * );
   * ```
   */
  constructor(
    protectedHeaders: Uint8Array,
    unprotectedHeaders: Map<number, unknown>
  ) {
    this.protectedHeaders = protectedHeaders;
    this.decodedProtectedHeaders = decodeCbor(protectedHeaders) as Map<
      number,
      unknown
    >;
    this.unprotectedHeaders = unprotectedHeaders;
  }

  /**
   * Retrieves a header value by label.
   *
   * @description
   * Searches for the header first in protected headers, then in unprotected headers.
   * Protected headers take precedence if the same label exists in both locations.
   * Returns undefined if the header is not found in either location.
   *
   * @param label - COSE header label (integer). Can be a standard {@link Headers} value or custom label.
   * @returns The header value, or undefined if not found
   *
   * @example
   * ```typescript
   * // Using standard header labels
   * const algorithm = coseBase.getHeader(Headers.Algorithm);
   * const keyId = coseBase.getHeader(Headers.KeyId);
   *
   * // Using custom header labels
   * const customValue = coseBase.getHeader(100); // private use header
   * ```
   */
  getHeader(label: number): unknown {
    return (
      this.decodedProtectedHeaders.get(label) ??
      this.unprotectedHeaders.get(label)
    );
  }
}
