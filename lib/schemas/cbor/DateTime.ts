import { z } from 'zod';
import { Tag } from 'cbor-x';
import { createTag0 } from '@/cbor';
import { getTypeName } from '@/utils/getTypeName';
import { valueInvalidTypeMessage } from '../messages';

/**
 * Generates an error message for an invalid date-time string or Date instance format.
 * @description
 * This error message is used when a provided string or Date instance cannot be parsed as a valid date-time.
 * The expected format is an ISO 8601 string ("YYYY-MM-DDTHH:MM:SSZ") or a parsable Date that can be normalized
 * to that format.
 *
 * @param invalidValue - The value (string or Date) that could not be parsed to a proper date-time.
 * @returns A standardized error message indicating the expected date-time format and the value received.
 *
 * @example
 * ```typescript
 * dateTimeInvalidFormatMessage('not-a-date');
 * // => "Expected YYYY-MM-DDTHH:MM:SSZ format, received not-a-date"
 * ```
 */
export const dateTimeInvalidFormatMessage = (
  invalidValue: string | Date
): string =>
  valueInvalidTypeMessage({
    expected: 'YYYY-MM-DDTHH:MM:SSZ format',
    received: String(invalidValue),
  });

/**
 * Generates an error message for invalid date-time input types.
 * @description
 * This error is used when the dateTimeSchema receives a type it does not support:
 * only "YYYY-MM-DDTHH:MM:SSZ" strings, CBOR Tag(0), or Date instances are valid.
 *
 * @param value - The received value of invalid type.
 * @returns A message stating the expected types and the actual type received.
 *
 * @example
 * ```typescript
 * dateTimeInvalidTypeMessage(123);
 * // => "Expected YYYY-MM-DDTHH:MM:SSZ string, Tag0, or Date, received number"
 * ```
 */
export const dateTimeInvalidTypeMessage = (value: unknown): string =>
  `Expected YYYY-MM-DDTHH:MM:SSZ string, Tag0, or Date, received ${getTypeName(
    value
  )}`;

/**
 * Generates an error message for invalid CBOR Tag(0) types used in date-time fields.
 * @description
 * Returns a standardized error message when a Tag instance is provided but is not a valid CBOR Tag(0)
 * containing a date-time string. The expected Tag should have `tag === 0` and the value should be
 * a string in RFC 3339 date-time (ISO UTC, "YYYY-MM-DDTHH:MM:SSZ") format.
 *
 * @param invalidTag - The Tag instance that failed validation.
 * @returns A formatted error message describing the expected type and the actual received value.
 *
 * @example
 * ```typescript
 * const tag = new Tag(123, 28);
 * throw new Error(dateTimeInvalidTagMessage(tag));
 * // "Expected CBOR Tag(0) containing YYYY-MM-DDTHH:MM:SSZ string, received {\"tag\":28,\"value\":123}."
 * ```
 */
export const dateTimeInvalidTagMessage = (invalidTag: Tag): string =>
  `Expected CBOR Tag(0) containing YYYY-MM-DDTHH:MM:SSZ string, received ${JSON.stringify(invalidTag)}.`;

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
 * - If a Tag is provided but is not a valid Tag(0) with a string value, returns {@link DATE_TIME_INVALID_TAG_MESSAGE}.
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
        message: dateTimeInvalidFormatMessage(value),
      });
      return z.NEVER;
    }
  }

  if (value instanceof Tag) {
    const tag = value as Tag;
    if (!(tag.tag === 0 && typeof tag.value === 'string')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dateTimeInvalidTagMessage(tag),
      });
      return z.NEVER;
    }
    try {
      return createTag0(new Date(tag.value as string));
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: dateTimeInvalidFormatMessage(tag.value as string),
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
        message: dateTimeInvalidFormatMessage(value),
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
