import { z } from 'zod';

export const DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE =
  'DigestID: Expected a number. Please provide a positive integer.';
export const DIGEST_ID_NUMBER_REQUIRED_MESSAGE =
  'DigestID: This field is required. Please provide a positive integer.';
export const DIGEST_ID_INTEGER_MESSAGE =
  'DigestID: Please provide an integer (no decimal places)';
export const DIGEST_ID_POSITIVE_MESSAGE =
  'DigestID: Please provide a positive integer greater than 0';

/**
 * Schema for digest ID in MSO
 * @description
 * Represents a unique identifier for a digest.
 * This schema validates that the ID is a positive integer (number).
 *
 * ```cddl
 * DigestID = uint
 * ```
 *
 * @example
 * ```typescript
 * const id = 1;
 * const result = digestIDSchema.parse(id); // Returns DigestID (number)
 *
 * // Fails with DIGEST_ID_INTEGER_MESSAGE (must be an integer)
 * // digestIDSchema.parse(1.5);
 *
 * // Fails with DIGEST_ID_POSITIVE_MESSAGE (must be > 0)
 * // digestIDSchema.parse(0);
 * ```
 */
export const digestIDSchema = z
  .number({
    invalid_type_error: DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE,
    required_error: DIGEST_ID_NUMBER_REQUIRED_MESSAGE,
  })
  .int({
    message: DIGEST_ID_INTEGER_MESSAGE,
  })
  .positive({
    message: DIGEST_ID_POSITIVE_MESSAGE,
  });

/**
 * Type definition for digest ID
 * @description
 * Represents a validated digest identifier
 *
 */
export type DigestID = z.output<typeof digestIDSchema>;
