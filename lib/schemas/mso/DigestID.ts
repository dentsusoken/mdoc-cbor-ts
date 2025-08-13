import { z } from 'zod';
import { createUintSchema } from '../common/Uint';

/**
 * Schema for digest ID in MSO
 * @description
 * Validates a required positive integer (`uint`) identifier for a digest. All
 * error messages are prefixed with `DigestID: ...` and follow the standardized
 * unsigned integer messaging provided by the common `Uint` schema.
 *
 * Validation rules:
 * - Requires a number type
 * - Requires an integer (no decimal places)
 * - Requires a strictly positive value (> 0)
 *
 * ```cddl
 * DigestID = uint
 * ```
 *
 * @example
 * ```typescript
 * const id = 1;
 * const result = digestIDSchema.parse(id); // number
 *
 * // Throws ZodError (not an integer)
 * // digestIDSchema.parse(1.5);
 *
 * // Throws ZodError (not positive)
 * // digestIDSchema.parse(0);
 * ```
 *
 * @see {@link createUintSchema}
 */
export const digestIDSchema = createUintSchema('DigestID');

/**
 * Type definition for digest ID
 * @description
 * Represents a validated positive integer digest identifier
 */
export type DigestID = z.output<typeof digestIDSchema>;
