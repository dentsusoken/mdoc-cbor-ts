import { z } from 'zod';
import { createRequiredSchema } from './Required';
import { Tag1004 } from '@/cbor/Tag1004';
import { toISOFullDateString } from '@/utils/toISOFullDateString';

/**
 * Creates an error message for invalid full-date format
 * @param target - The target field name to include in the error message
 * @returns Error message string indicating expected YYYY-MM-DD format
 */
export const fullDateInvalidFormatMessage = (target: string): string =>
  `${target}: Expected YYYY-MM-DD string, but received a different format.`;

/**
 * Creates an error message for invalid full-date type
 * @param target - The target field name to include in the error message
 * @returns Error message string indicating expected string or Tag1004 type
 */
export const fullDateInvaliTypeMessage = (target: string): string =>
  `${target}: Expected YYYY-MM-DD string, but received a different type.`;

/**
 * Creates the inner schema for full-date validation
 * @description
 * This schema accepts either a string in YYYY-MM-DD format, a Tag1004 instance, or a
 * Date instance and transforms the input to a validated date string. String inputs
 * are validated by attempting to create a Tag1004 instance, which will throw for
 * invalid formats. Date inputs are normalized using `toISOFullDateString`.
 *
 * @param target - The target field name used in error messages
 * @returns A Zod schema that validates and transforms date inputs to YYYY-MM-DD strings
 */
const createFullDateInnerSchema = (
  target: string
): z.ZodType<string, z.ZodTypeDef, string | Tag1004 | Date> =>
  z.union(
    [
      z.string().transform((value, ctx) => {
        try {
          const tag1004 = new Tag1004(value);
          return tag1004.value;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: fullDateInvalidFormatMessage(target),
          });
          return z.NEVER;
        }
      }),
      z.instanceof(Tag1004).transform((tag1004) => tag1004.value),
      z.instanceof(Date).transform((date, ctx) => {
        try {
          return toISOFullDateString(date);
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: fullDateInvalidFormatMessage(target),
          });
          return z.NEVER;
        }
      }),
    ],
    {
      errorMap: () => ({
        message: fullDateInvaliTypeMessage(target),
      }),
    }
  );

/**
 * Builds a full-date schema that validates date strings and Tag1004 instances.
 * @description
 * The resulting schema:
 * - Accepts either a string in YYYY-MM-DD format, a Tag1004 instance, or a Date
 * - Returns a validated date string in YYYY-MM-DD format
 * - Provides target-prefixed error messages for invalid formats and types
 *
 * This schema is designed for validating date values that can come from either:
 * - Direct string input (e.g., from JSON)
 * - Direct Date input (runtime-generated dates)
 * - CBOR decoding where Tag(1004) is automatically converted to Tag1004 instances
 *
 * String inputs are validated by attempting to create a Tag1004 instance, which
 * will throw an error for invalid date formats. Tag1004 instances are directly
 * converted to their string representation.
 *
 * ```cddl
 * full-date = tstr ; YYYY-MM-DD format
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "ValidityInfo", "IssuerAuth")
 *
 * @example
 * ```typescript
 * const validityInfoSchema = createFullDateSchema('ValidityInfo');
 * const value1 = validityInfoSchema.parse('2024-03-20'); // '2024-03-20'
 * const value2 = validityInfoSchema.parse(new Tag1004('2024-03-20')); // '2024-03-20'
 * const value3 = validityInfoSchema.parse(new Date('2024-03-20T15:30:00Z')); // '2024-03-20'
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid format)
 * // Message: "ValidityInfo: Expected YYYY-MM-DD string, but received a different format."
 * const validityInfoSchema = createFullDateSchema('ValidityInfo');
 * validityInfoSchema.parse('invalid-date');
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "ValidityInfo: Expected YYYY-MM-DD string, but received a different type."
 * const validityInfoSchema = createFullDateSchema('ValidityInfo');
 * validityInfoSchema.parse(123); // Number instead of string or Tag1004
 * ```
 */
export const createFullDateSchema = (target: string): z.ZodType<string> =>
  createRequiredSchema(target).pipe(createFullDateInnerSchema(target));
