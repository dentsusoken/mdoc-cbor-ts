import { z } from 'zod';

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
        invalid_type_error:
          'DigestID: Expected a number. Please provide a positive integer.',
        required_error:
          'DigestID: This field is required. Please provide a positive integer.',
      })
      .int({
        message: 'DigestID: Please provide an integer (no decimal places)',
      })
      .positive({
        message: 'DigestID: Please provide a positive integer greater than 0',
      }),
    z
      .string({
        invalid_type_error:
          'DigestID: Expected a string with digits. Please provide a positive integer as string.',
        required_error:
          'DigestID: This field is required. Please provide a positive integer as string.',
      })
      .regex(/^\d+$/, {
        message:
          'DigestID: Please provide a string containing only digits (e.g., "123")',
      })
      .transform((s) => Number(s))
      .refine((n) => n > 0, {
        message: 'DigestID: Please provide a positive integer greater than 0',
      }),
  ],
  {
    errorMap: () => ({
      message:
        'DigestID: Please provide a positive integer (as number or string of digits)',
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
