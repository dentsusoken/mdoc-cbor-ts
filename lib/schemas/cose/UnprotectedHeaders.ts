import { createLabelKeyMapSchema } from './LabelKeyMap';

/**
 * Schema for COSE unprotected headers
 * @description
 * Represents COSE unprotected headers as a map with COSE label keys (integers or non-empty strings) and any values.
 * Unprotected headers are not integrity-protected and are not included in the signature computation.
 * They can contain algorithm parameters, key identifiers, and other metadata.
 *
 * ```cddl
 * unprotected = {
 *   * label => any
 * }
 * label = int / tstr
 * ```
 *
 * @example
 * ```typescript
 * const unprotectedHeaders = new Map([[1, 'ES256'], [4, new Uint8Array([1, 2, 3])]]);
 * const result = unprotectedHeadersSchema.parse(unprotectedHeaders); // Returns Map<number | string, unknown>
 * ```
 *
 * @example
 * ```typescript
 * // Can also use string labels
 * const unprotectedHeaders = new Map([['alg', 'ES256'], ['kid', 'key-1']]);
 * const result = unprotectedHeadersSchema.parse(unprotectedHeaders); // Returns Map<number | string, unknown>
 * ```
 */
export const unprotectedHeadersSchema =
  createLabelKeyMapSchema('UnprotectedHeaders');
