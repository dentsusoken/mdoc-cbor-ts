import { createUintKeyMapSchema } from '@/schemas/common/UintKeyMap';

/**
 * Schema for COSE unprotected headers
 * @description
 * Represents COSE unprotected headers as a map with unsigned integer keys and any values.
 * Unprotected headers are not integrity-protected and are not included in the signature computation.
 * They can contain algorithm parameters, key identifiers, and other metadata.
 *
 * ```cddl
 * unprotected = {
 *   * uint => any
 * }
 * ```
 *
 * @example
 * ```typescript
 * const unprotectedHeaders = new Map([[1, 'ES256'], [4, new Uint8Array([1, 2, 3])]]);
 * const result = unprotectedHeadersSchema.parse(unprotectedHeaders); // Returns Map<number, unknown>
 * ```
 */
export const unprotectedHeadersSchema =
  createUintKeyMapSchema('UnprotectedHeaders');
