import { z } from 'zod';

/**
 * Zod schema for DCQL value types in claims.
 *
 * Represents the allowable DCQL primitive types:
 * - string
 * - number
 * - boolean
 * - null
 *
 * Used to validate and infer DCQL claim values.
 *
 * @see {@link DcqlValue}
 */
export const dcqlValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

/**
 * Type inferred from {@link dcqlValueSchema} representing a DCQL claim value.
 *
 * Corresponds to:
 * - string
 * - number
 * - boolean
 * - null
 */
export type DcqlValue = z.output<typeof dcqlValueSchema>;
