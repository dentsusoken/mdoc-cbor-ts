import { z } from 'zod';
import { createRequiredSchema } from './Required';
import { Tag0 } from '@/cbor/Tag0';
import { toISODateTimeString } from '@/utils/toISODateTimeString';

/**
 * Creates an error message for invalid date-time format
 * @param target - The target field name to include in the error message
 * @returns Error message string indicating expected YYYY-MM-DDTHH:MM:SSZ format
 */
export const dateTimeInvalidFormatMessage = (target: string): string =>
  `${target}: Expected YYYY-MM-DDTHH:MM:SSZ string, but received a different format.`;

/**
 * Creates an error message for invalid date-time type
 * @param target - The target field name to include in the error message
 * @returns Error message string indicating expected string (YYYY-MM-DDTHH:MM:SSZ) or Tag0 type
 */
export const dateTimeInvalidTypeMessage = (target: string): string =>
  `${target}: Expected YYYY-MM-DDTHH:MM:SSZ string or Tag0, but received a different type.`;

/**
 * Creates the inner schema for date-time validation
 * @description
 * This schema accepts either:
 * - a string in YYYY-MM-DDTHH:MM:SSZ format (or any parseable ISO 8601 date-time),
 * - a Tag0 instance, or
 * - a Date instance
 * and transforms the input into a validated date-time string without milliseconds
 * (YYYY-MM-DDTHH:MM:SSZ). String inputs are validated by attempting to create a Tag0
 * instance; Date inputs are normalized using `toISODateTimeString`.
 *
 * @param target - The target field name used in error messages
 * @returns A Zod schema that validates and transforms inputs to YYYY-MM-DDTHH:MM:SSZ strings
 */
const createDateTimeInnerSchema = (
  target: string
): z.ZodType<string, z.ZodTypeDef, string | Tag0 | Date> =>
  z.union(
    [
      z.string().transform((value, ctx) => {
        try {
          const tag0 = new Tag0(value);
          return tag0.value;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: dateTimeInvalidFormatMessage(target),
          });
          return z.NEVER;
        }
      }),
      z.instanceof(Tag0).transform((tag0) => tag0.value),
      z.instanceof(Date).transform((date, ctx) => {
        try {
          return toISODateTimeString(date);
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: dateTimeInvalidFormatMessage(target),
          });
          return z.NEVER;
        }
      }),
    ],
    {
      errorMap: () => ({
        message: dateTimeInvalidTypeMessage(target),
      }),
    }
  );

/**
 * Builds a date-time schema that validates date-time strings and Tag0 instances.
 * @description
 * The resulting schema:
 * - Accepts a string in YYYY-MM-DDTHH:MM:SSZ format (or parseable ISO date-time), a Tag0 instance, or a Date
 * - Returns a validated date-time string in YYYY-MM-DDTHH:MM:SSZ format (milliseconds stripped)
 * - Provides target-prefixed error messages for invalid formats and types
 *
 * This schema is designed for validating date-time values that can come from either:
 * - Direct string input (e.g., from JSON)
 * - Direct Date input (runtime-generated dates)
 * - CBOR decoding where Tag(0) is automatically converted to Tag0 instances
 *
 * Example accepted inputs are normalized to the exact format:
 * - "2024-03-20T15:30:00.123Z" -> "2024-03-20T15:30:00Z"
 * - "2024-03-20T15:30:00+09:00" -> "2024-03-20T06:30:00Z" (UTC)
 * - new Date("2024-03-20T15:30:00.123Z") -> "2024-03-20T15:30:00Z"
 *
 * @param target - Prefix used in error messages (e.g., "ValidityInfo", "IssuerAuth")
 */
export const createDateTimeSchema = (target: string): z.ZodType<string> =>
  createRequiredSchema(target).pipe(createDateTimeInnerSchema(target));
