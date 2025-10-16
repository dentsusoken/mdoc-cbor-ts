import { z } from 'zod';
import { Tag } from 'cbor-x';
import { createTag1004 } from '@/cbor/createTag1004';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Error message for invalid full-date format (YYYY-MM-DD).
 * @description
 * Used when a string or input is provided that cannot be parsed as a valid full-date.
 *
 * The value must be parseable as "YYYY-MM-DD" or as an ISO 8601 date string that normalizes to a valid date.
 *
 * @see {@link fullDateSchema}
 */
export const FULL_DATE_INVALID_FORMAT_MESSAGE =
  'Expected YYYY-MM-DD string, but received a different format.';

/**
 * Builds an error message for when the input is not a valid full-date input type.
 * @description
 * Used when the value is not one of the supported types: string (YYYY-MM-DD), CBOR Tag(1004), or Date instance.
 * Includes the actual input type (via {@link getTypeName}) in the message.
 *
 * @param value - The value that was provided as input.
 * @returns Error message specifying the supported types and actual type.
 *
 * @see {@link fullDateSchema}
 */
export const fullDateInvalidTypeMessage = (value: unknown): string =>
  `Expected YYYY-MM-DD string, Tag(1004), or Date, but received ${getTypeName(value)}`;

/**
 * Error message for invalid CBOR Tag(1004) type.
 * @description
 * Used when a CBOR Tag is provided, but it is not Tag(1004) or does not
 * contain a string value suitable for a full-date.
 *
 * @see {@link fullDateSchema}
 */
export const FULL_DATE_INVALID_TAG1004_MESSAGE =
  'Expected CBOR Tag(1004) containing YYYY-MM-DD string, but received a different type.';

/**
 * Zod schema for validating and normalizing "full-date" values to the RFC 3339 format "YYYY-MM-DD".
 *
 * @description
 * This schema accepts values representing a full-date from common sources and returns a string in
 * the normalized form "YYYY-MM-DD" (UTC, zero-padded month and day). It supports:
 *
 * - `string`: Any value parseable as an ISO 8601 date, normalized to "YYYY-MM-DD".
 *   - Example: "2023-07-15" or "2023-07-15T10:30:00Z" ⇒ "2023-07-15"
 * - `Tag`: CBOR Tag(1004) instance wrapping a full-date string.
 *   - Example: `new Tag("2023-07-15", 1004)` ⇒ "2023-07-15"
 * - `Date`: JavaScript `Date` object
 *   - Example: `new Date("2023-07-15T00:00:00Z")` ⇒ "2023-07-15"
 *
 * @remarks
 * ### Output
 * - Valid input is always returned as a string in "YYYY-MM-DD" normalized format (UTC, zero-padded).
 *
 * ### Error Handling
 * - If a value is not parseable as a valid date (as a string or inside a tag), returns {@link FULL_DATE_INVALID_FORMAT_MESSAGE}.
 * - If a CBOR Tag is not Tag(1004) with a string value, returns {@link FULL_DATE_INVALID_TAG1004_MESSAGE}.
 * - If the input type is not one of the supported ones, returns {@link fullDateInvalidTypeMessage}.
 *
 * @example
 * // String input
 * fullDateSchema.parse("2023-07-15"); // "2023-07-15"
 * fullDateSchema.parse("2023-07-15T09:33:00Z"); // "2023-07-15"
 *
 * // Date input
 * fullDateSchema.parse(new Date("2023-07-15T00:00:00Z")); // "2023-07-15"
 *
 * // Tag input
 * fullDateSchema.parse(new Tag("2023-07-15", 1004)); // "2023-07-15"
 *
 * @returns Zod schema that validates and transforms date-like inputs to normalized YYYY-MM-DD strings.
 */
export const fullDateSchema = z.any().transform((value, ctx) => {
  if (typeof value === 'string') {
    try {
      return createTag1004(new Date(value));
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: FULL_DATE_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  if (value instanceof Tag) {
    const tag = value as Tag;
    if (!(tag.tag === 1004 && typeof tag.value === 'string')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: FULL_DATE_INVALID_TAG1004_MESSAGE,
      });
      return z.NEVER;
    }
    try {
      return createTag1004(new Date(tag.value as string));
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: FULL_DATE_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  if (value instanceof Date) {
    try {
      return createTag1004(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: FULL_DATE_INVALID_FORMAT_MESSAGE,
      });
      return z.NEVER;
    }
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: fullDateInvalidTypeMessage(value),
  });
  return z.NEVER;
});

/**
 * Type definition for a validated full-date string.
 *
 * This type represents a string in the "YYYY-MM-DD" format as validated and normalized by {@link fullDateSchema}.
 *
 * @example
 * const dateString: FullDate = fullDateSchema.parse('2024-03-20T12:00:00Z'); // "2024-03-20"
 */
export type FullDate = z.output<typeof fullDateSchema>;
