import { z } from 'zod';

/**
 * Schema for digest ID in MSO
 * @description
 * Represents a unique identifier for a digest.
 * This schema validates that the ID is a positive integer, either as a number
 * or as a string containing only digits.
 *
 * @example
 * ```typescript
 * const id = 1;
 * const result = digestIDSchema.parse(id); // Returns DigestID
 * ```
 */
export const digestIDSchema = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s)),
]);

/**
 * Type definition for digest ID
 * @description
 * Represents a validated digest identifier
 *
 * ```cddl
 * DigestID = uint
 * ```
 */
export type DigestID = z.infer<typeof digestIDSchema>;
