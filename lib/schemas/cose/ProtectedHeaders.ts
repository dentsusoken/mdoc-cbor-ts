import { createBytesSchema } from '@/schemas/common/Bytes';

/**
 * Schema for COSE protected headers
 * @description
 * Represents COSE protected headers as a byte string containing CBOR-encoded header parameters.
 * Protected headers are integrity-protected and must be included in the signature computation.
 *
 * ```cddl
 * protected = bstr .cbor map
 * ```
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]); // CBOR-encoded {1: -7}
 * const result = protectedHeadersSchema.parse(protectedHeaders); // Returns Uint8Array
 * ```
 */
export const protectedHeadersSchema = createBytesSchema('ProtectedHeaders');
