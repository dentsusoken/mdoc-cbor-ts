import { z } from 'zod';
import { createRequiredSchema } from './Required';
import { Tag } from 'cbor-x';
import { createTag1004 } from '@/cbor/createTag1004';
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
 * @returns Error message string indicating expected string (YYYY-MM-DD) or CBOR Tag(1004) type
 */
export const fullDateInvalidTypeMessage = (target: string): string =>
  `${target}: Expected YYYY-MM-DD string or Tag1004, but received a different type.`;

/**
 * Creates an error message for invalid CBOR Tag1004 type
 * @param target - The target field name to include in the error message
 * @returns Error message string indicating expected CBOR Tag(1004) with full-date string
 */
export const fullDateInvalidTag1004Message = (target: string): string =>
  `${target}: Expected CBOR Tag(1004) containing a full-date string, but received a different type.`;

/**
 * Creates the inner schema for full-date validation
 * @description
 * This schema accepts either:
 * - a string in YYYY-MM-DD format (or any parseable ISO date),
 * - a CBOR Tag(1004) instance, or
 * - a Date instance
 * and transforms the input to a validated date string in YYYY-MM-DD format.
 * String and Tag inputs are normalized by parsing as dates and recreating as Tag(1004);
 * Date inputs are normalized using `toISOFullDateString`.
 *
 * @param target - The target field name used in error messages
 * @returns A Zod schema that validates and transforms date inputs to YYYY-MM-DD strings
 */
const createFullDateInnerSchema = (
  target: string
): z.ZodType<string, z.ZodTypeDef, string | Tag | Date> =>
  z.union(
    [
      z.string().transform((value, ctx) => {
        try {
          const tag1004 = createTag1004(new Date(value));
          return tag1004.value as string;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: fullDateInvalidFormatMessage(target),
          });
          return z.NEVER;
        }
      }),
      z
        .instanceof(Tag)
        .refine((tag) => tag.tag === 1004 && typeof tag.value === 'string', {
          message: fullDateInvalidTag1004Message(target),
        })
        .transform((tag, ctx) => {
          try {
            const tag1004 = createTag1004(new Date(tag.value as string));
            return tag1004.value as string;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: fullDateInvalidFormatMessage(target),
            });
            return z.NEVER;
          }
        }),
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
        message: fullDateInvalidTypeMessage(target),
      }),
    }
  );

/**
 * Builds a full-date schema that validates date strings and CBOR Tag(1004) instances.
 * @description
 * The resulting schema:
 * - Accepts a string in YYYY-MM-DD format (or parseable ISO date), a CBOR Tag(1004) instance, or a Date
 * - Returns a validated date string in YYYY-MM-DD format
 * - Provides target-prefixed error messages for invalid formats and types
 *
 * This schema is designed for validating date values that can come from either:
 * - Direct string input (e.g., from JSON)
 * - Direct Date input (runtime-generated dates)
 * - CBOR decoding where Tag(1004) is automatically converted to Tag instances
 *
 * String inputs are validated by parsing as dates and normalizing to YYYY-MM-DD format.
 * Tag instances are validated to ensure they are Tag(1004) with string values, then normalized.
 * Date instances are converted directly to YYYY-MM-DD format.
 *
 * Example accepted inputs are normalized to the exact format:
 * - "2024-03-20" -> "2024-03-20"
 * - "2024-03-20T15:30:00Z" -> "2024-03-20"
 * - new Date("2024-03-20T15:30:00Z") -> "2024-03-20"
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
 * const value2 = validityInfoSchema.parse(new Tag('2024-03-20', 1004)); // '2024-03-20'
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
 * // Message: "ValidityInfo: Expected YYYY-MM-DD string or Tag1004, but received a different type."
 * const validityInfoSchema = createFullDateSchema('ValidityInfo');
 * validityInfoSchema.parse(123); // Number instead of string or Tag
 * ```
 */
export const createFullDateSchema = (target: string): z.ZodType<string> =>
  createRequiredSchema(target).pipe(createFullDateInnerSchema(target));
