import { z } from 'zod';

export const DIGEST_ID_UNION_MESSAGE =
  'DigestID: Please provide a positive integer (as number or string of digits)';

export const DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE =
  'DigestID: Expected a number. Please provide a positive integer.';
export const DIGEST_ID_NUMBER_REQUIRED_MESSAGE =
  'DigestID: This field is required. Please provide a positive integer.';
export const DIGEST_ID_INTEGER_MESSAGE =
  'DigestID: Please provide an integer (no decimal places)';
export const DIGEST_ID_POSITIVE_MESSAGE =
  'DigestID: Please provide a positive integer greater than 0';

export const DIGEST_ID_STRING_INVALID_TYPE_MESSAGE =
  'DigestID: Expected a string with digits. Please provide a positive integer as string.';
export const DIGEST_ID_STRING_REQUIRED_MESSAGE =
  'DigestID: This field is required. Please provide a positive integer as string.';
export const DIGEST_ID_STRING_DIGITS_MESSAGE =
  'DigestID: Please provide a string containing only digits (e.g., "123")';

/**
 * Schema for digest ID in MSO
 * @description
 * Represents a unique identifier for a digest.
 * This schema validates that the ID is a positive integer, either as a number
 * or as a string containing only digits. The value is normalized to a number.
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
 * const idStr = "42";
 * const result2 = digestIDSchema.parse(idStr); // Returns 42 (number)
 * ```
 */
export const digestIDSchema = z.union(
  [
    z
      .number({
        invalid_type_error: DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE,
        required_error: DIGEST_ID_NUMBER_REQUIRED_MESSAGE,
      })
      .int({
        message: DIGEST_ID_INTEGER_MESSAGE,
      })
      .positive({
        message: DIGEST_ID_POSITIVE_MESSAGE,
      }),
    z
      .string({
        invalid_type_error: DIGEST_ID_STRING_INVALID_TYPE_MESSAGE,
        required_error: DIGEST_ID_STRING_REQUIRED_MESSAGE,
      })
      .regex(/^\d+$/, {
        message: DIGEST_ID_STRING_DIGITS_MESSAGE,
      })
      .transform((s) => Number(s))
      .refine((n) => n > 0, {
        message: DIGEST_ID_POSITIVE_MESSAGE,
      }),
  ],
  {
    errorMap: () => ({
      message: DIGEST_ID_UNION_MESSAGE,
    }),
  }
);

/**
 * Type definition for digest ID
 * @description
 * Represents a validated digest identifier
 *
 */
export type DigestID = z.output<typeof digestIDSchema>;
