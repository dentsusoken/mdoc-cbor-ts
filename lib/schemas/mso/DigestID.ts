import { z } from 'zod';
import { createUintSchema } from '@/schemas/common/Uint';

/**
 * Schema for digest ID in MSO
 * @description
 * Validates a required non-negative integer (`uint`) identifier for a digest. All
 * error messages are prefixed with `DigestID: ...` and follow the standardized
 * unsigned integer messaging provided by the common `Uint` schema.
 *
 * Validation rules:
 * - Requires a number type
 * - Requires an integer (no decimal places)
 * - Requires a non-negative value (>= 0)
 *
 * ```cddl
 * DigestID = uint
 * ```
 *
 * @example
 * ```typescript
 * const id = 0;
 * const result = digestIDSchema.parse(id); // number - 0 is valid
 *
 * // Throws ZodError (not an integer)
 * // digestIDSchema.parse(1.5);
 *
 * // Throws ZodError (negative)
 * // digestIDSchema.parse(-1);
 * ```
 *
 * @see {@link createUintSchema}
 */
export const digestIDSchema = createUintSchema('DigestID');

/**
 * Type definition for digest ID
 * @description
 * Represents a validated non-negative integer digest identifier
 */
export type DigestID = z.output<typeof digestIDSchema>;
