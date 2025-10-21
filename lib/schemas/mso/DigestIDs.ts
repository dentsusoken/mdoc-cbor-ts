import { z } from 'zod';
import { createMapSchema } from '@/schemas/containers/Map';
import { bytesSchema } from '@/schemas/cbor/Bytes';

/**
 * Zod schema for DigestIDs in MSO (Mobile Security Object).
 *
 * @description
 * Validates a required, non-empty `Map` whose keys are digest identifiers (`DigestID`) and
 * whose values are binary digests (`Digest`). Specifically:
 * - Keys must be non-negative integers (validated by {@link digestIDSchema}).
 * - Values must be `Uint8Array` instances (validated by {@link digestSchema}).
 * - Input must be a `Map` (plain objects, arrays, etc. are rejected).
 * - The map must contain at least one entry (non-empty).
 * - All error messages are prefixed with `DigestIDs:` and follow standardized map schema conventions.
 *
 * CDDL:
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 *
 * Validation rules:
 * - Requires `Map` instance as input (not array/object).
 * - Must not be empty, i.e., must have at least one entry.
 * - Each key is validated to be a non-negative integer (`DigestID`).
 * - Each value is validated to be a `Uint8Array` (`Digest`).
 *
 * @example
 * ```typescript
 * // Valid usage:
 * const digestIDs = new Map<number, Uint8Array>([
 *   [1, new Uint8Array([0xde, 0xad, 0xbe, 0xef])],
 * ]);
 * digestIDsSchema.parse(digestIDs); // success, returns Map<number, Uint8Array>
 * ```
 *
 * @example
 * ```typescript
 * // Invalid: empty map
 * // Throws ZodError (empty map not allowed)
 * digestIDsSchema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Invalid: not a Map
 * // Throws ZodError (input must be a Map)
 * digestIDsSchema.parse({ 1: new Uint8Array([0xde]) });
 * ```
 *
 * @see {@link createMapSchema}
 * @see {@link bytesSchema}
 */
export const digestIDsSchema = createMapSchema({
  target: 'DigestIDs',
  keySchema: z.number().int().nonnegative(),
  valueSchema: bytesSchema,
  nonempty: true,
});

/**
 * Type definition for digest IDs
 * @description
 * Represents a validated record of digest IDs and their digest values.
 *
 * @see {@link digestIDsSchema}
 * @see {@link createMapSchema}
 * @see {@link bytesSchema}
 */
export type DigestIDs = z.output<typeof digestIDsSchema>;
