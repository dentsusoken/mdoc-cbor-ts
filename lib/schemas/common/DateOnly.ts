import { z } from 'zod';
import { DateOnly } from '@/cbor/DateOnly';

export const DATEONLY_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected a DateOnly instance, but received a different type.';
export const DATEONLY_INVALID_DATE_MESSAGE_SUFFIX =
  'The DateOnly instance contains an invalid date.';

/**
 * Builds a date-only schema that validates DateOnly instances.
 * @description
 * The resulting schema:
 * - Requires a DateOnly instance with a target-prefixed invalid type message
 * - Validates that the DateOnly is valid by checking if toISOString() throws an error
 *
 * This schema is designed for validating DateOnly instances that come from CBOR decoding,
 * where Tag(1) is automatically converted to DateOnly instances by the CBOR-x extension.
 * Invalid DateOnly instances (created from malformed date strings in CBOR) will throw
 * RangeError when toISOString() is called, which this schema catches and reports as
 * a validation error.
 *
 * ```cddl
 * DateOnly = tdate
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "ValidityInfo", "IssuerAuth")
 *
 * @example
 * ```typescript
 * const validityInfoSchema = createDateOnlySchema('ValidityInfo');
 * const dateOnly = new DateOnly('2024-03-20');
 * const value = validityInfoSchema.parse(dateOnly); // DateOnly instance
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "ValidityInfo: Expected a DateOnly instance, but received a different type."
 * const validityInfoSchema = createDateOnlySchema('ValidityInfo');
 * validityInfoSchema.parse('2024-03-20'); // String instead of DateOnly
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid date)
 * // Message: "ValidityInfo: The DateOnly instance contains an invalid date."
 * const validityInfoSchema = createDateOnlySchema('ValidityInfo');
 * // This would be created from CBOR decoding of invalid date string
 * const invalidDateOnly = decodeCbor(invalidCborData) as DateOnly;
 * validityInfoSchema.parse(invalidDateOnly);
 * ```
 */
export const createDateOnlySchema = (target: string): z.ZodType<DateOnly> =>
  z
    .instanceof(DateOnly, {
      message: `${target}: ${DATEONLY_INVALID_TYPE_MESSAGE_SUFFIX}`,
    })
    .refine(
      (date) => {
        try {
          date.toISOString();
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: `${target}: ${DATEONLY_INVALID_DATE_MESSAGE_SUFFIX}`,
      }
    );
