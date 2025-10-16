import { z } from 'zod';
import { digestSchema } from './Digest';
import { digestIDSchema } from './DigestID';
import { createMapSchema } from '@/schemas/common/containers/Map';

/**
 * Schema for digest IDs in MSO
 * @description
 * Validates a required non-empty `Map<DigestID, Digest>`, where keys are
 * positive integers validated by `digestIDSchema` and values are binary
 * digests validated by `digestSchema`.
 *
 * Error messages are prefixed with `DigestIDs: ...` and follow the standardized
 * messaging provided by the common Map schema utilities. The Map must contain
 * at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Requires at least one entry (non-empty)
 * - Each key must satisfy `digestIDSchema` (positive integer)
 * - Each value must satisfy `digestSchema` (`Uint8Array` output)
 *
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 *
 * @example
 * ```typescript
 * const digestIDs = new Map<number, Uint8Array>([
 *   [1, new Uint8Array([0xde, 0xad, 0xbe, 0xef])],
 * ]);
 * const result = digestIDsSchema.parse(digestIDs); // Map<number, Uint8Array>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
 * // digestIDsSchema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not a Map)
 * // digestIDsSchema.parse({ 1: new Uint8Array([0xde]) });
 * ```
 *
 * @see digestIDSchema
 * @see digestSchema
 * @see createMapSchema
 */
export const digestIDsSchema = createMapSchema({
  target: 'DigestIDs',
  keySchema: digestIDSchema,
  valueSchema: digestSchema,
});

/**
 * Type definition for digest IDs
 * @description
 * Represents a validated record of digest IDs and their digest values
 *
 * @see digestIDSchema
 * @see digestSchema
 */
export type DigestIDs = z.output<typeof digestIDsSchema>;
