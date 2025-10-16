import { z } from 'zod';
import { Tag } from 'cbor-x';
import { createTag0 } from '@/cbor';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Error message for invalid date-time format
 * @description
 * Used when a string is provided but cannot be parsed as a valid date-time.
 * The string must be in YYYY-MM-DDTHH:MM:SSZ format or any parseable ISO 8601 date-time.
 */
export const DATE_TIME_INVALID_FORMAT_MESSAGE =
  'Expected YYYY-MM-DDTHH:MM:SSZ string, but received a different format.';

/**
 * Error message for invalid date-time type
 * @description
 * Used when the input is not one of the expected types (string, Tag0, or Date).
 * This is the union error message for the dateTimeSchema.
 */
export const dateTimeInvalidTypeMessage = (value: unknown): string =>
  `Expected YYYY-MM-DDTHH:MM:SSZ string, Tag0, or Date, but received ${getTypeName(
    value
  )}`;

/**
 * Error message for invalid CBOR Tag0 type
 * @description
 * Used when a Tag instance is provided but is not a valid Tag(0) with a string value.
 * The Tag must have tag number 0 and contain an RFC 3339 date-time string.
 */
export const DATE_TIME_INVALID_TAG0_MESSAGE =
  'Expected CBOR Tag(0) containing YYYY-MM-DDTHH:MM:SSZ string, but received a different type.';

/**
 * Zod schema for validating and normalizing date-time values to CBOR Tag(0) format.
 *
 * @description
 * Accepts a variety of common input types and produces a CBOR Tag(0) object
 * containing a normalized RFC 3339 date-time string (in the form YYYY-MM-DDTHH:MM:SSZ).
 *
 * ### Supported Input Types
 * - `string`: Any parseable ISO 8601 date-time string
 *   - Example: "2024-03-20T10:00:00Z"
 * - `Tag`: CBOR Tag(0) instance wrapping a date-time string
 * - `Date`: JavaScript Date object
 *
 * ### Output
 * - All valid inputs are transformed to a CBOR Tag(0) whose value is the normalized date-time string
 *   in UTC ("YYYY-MM-DDTHH:MM:SSZ" format, without milliseconds).
 *
 * ### Error Handling
 * - If a string is provided but cannot be parsed as a valid date-time, returns {@link DATE_TIME_INVALID_FORMAT_MESSAGE}.
 * - If a Tag is provided but is not a valid Tag(0) with a string value, returns {@link DATE_TIME_INVALID_TAG0_MESSAGE}.
 * - If the input is not a supported type (string, Tag(0), or Date), returns {@link dateTimeInvalidTypeMessage}.
 *
 * @example
 * ```typescript
 * // ISO String input
 * dateTimeSchema.parse('2024-03-20T10:00:00.123Z');
 * // -> Tag(0) with value "2024-03-20T10:00:00Z"
 *
 * // Date input
 * dateTimeSchema.parse(new Date('2024-03-20T10:00:00Z'));
 * // -> Tag(0) with value "2024-03-20T10:00:00Z"
 *
 * // Tag input
 * dateTimeSchema.parse(new Tag('2024-03-20T10:00:00Z', 0));
 * // -> Tag(0) with value "2024-03-20T10:00:00Z"
 * ```
 *
 * @see createTag0
 * @returns Zod schema for date-time fields
 */
export const dateTimeSchema = z.any().transform((value, ctx) => {
  if (typeof value === 'string') {
    try {
      return createTag0(new Date(value));
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DATE_TIME_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  if (value instanceof Tag) {
    const tag = value as Tag;
    if (!(tag.tag === 0 && typeof tag.value === 'string')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DATE_TIME_INVALID_TAG0_MESSAGE,
      });
      return z.NEVER;
    }
    try {
      return createTag0(new Date(tag.value as string));
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DATE_TIME_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  if (value instanceof Date) {
    try {
      return createTag0(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DATE_TIME_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: dateTimeInvalidTypeMessage(value),
  });
  return z.NEVER;
});
