import { z } from 'zod';

/**
 * Schema for validating number keys in MSO
 * @description
 * Represents a positive integer that can be provided as a number or string.
 * This schema validates and normalizes the key format.
 *
 * ```cddl
 * NumberKey = uint
 * ```
 *
 * @example
 * ```typescript
 * const validNumberKey = 123;
 * const result = numberKeySchema.parse(validNumberKey); // Returns number
 *
 * const validStringKey = "456";
 * const result2 = numberKeySchema.parse(validStringKey); // Returns number
 * ```
 */
export const numberKeySchema = z.union(
  [
    z
      .number({
        invalid_type_error:
          'NumberKey: Expected a number, but received a different type. Please provide a positive integer.',
        required_error:
          'NumberKey: This field is required. Please provide a positive integer.',
      })
      .int({
        message: 'NumberKey: Please provide an integer (no decimal places)',
      })
      .positive({
        message: 'NumberKey: Please provide a positive integer greater than 0',
      }),
    z
      .string({
        invalid_type_error:
          'NumberKey: Expected a string, but received a different type. Please provide a positive integer as string.',
        required_error:
          'NumberKey: This field is required. Please provide a positive integer as string.',
      })
      .regex(/^\d+$/, {
        message:
          'NumberKey: Please provide a string containing only digits (e.g., "123")',
      })
      .transform((s) => Number(s))
      .refine((n) => n > 0, {
        message: 'NumberKey: Please provide a positive integer greater than 0',
      }),
  ],
  {
    errorMap: () => ({
      message:
        'NumberKey: Please provide a positive integer (as number or string)',
    }),
  }
);

/**
 * Type definition for number keys
 * @description
 * Represents a validated positive integer key that has been normalized through the numberKeySchema
 *
 * ```cddl
 * NumberKey = uint
 * ```
 */
export type NumberKey = z.output<typeof numberKeySchema>;
