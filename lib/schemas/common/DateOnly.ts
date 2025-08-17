import { z } from 'zod';
import { DateOnly } from '@/cbor/DateOnly';

/**
 * Creates an error message for invalid DateOnly types
 * @description
 * Generates a standardized error message when a DateOnly validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a DateOnly instance.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = dateOnlyInvalidTypeMessage('ValidityInfo');
 * // Returns: "ValidityInfo: Expected a DateOnly instance, but received a different type."
 * ```
 */
export const dateOnlyInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a DateOnly instance, but received a different type.`;

/**
 * Creates an error message for invalid DateOnly instances
 * @description
 * Generates a standardized error message when a DateOnly validation fails because
 * the DateOnly instance contains an invalid date.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = dateOnlyInvalidDateMessage('ValidityInfo');
 * // Returns: "ValidityInfo: The DateOnly instance contains an invalid date."
 * ```
 */
export const dateOnlyInvalidDateMessage = (target: string): string =>
  `${target}: The DateOnly instance contains an invalid date.`;

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
      message: dateOnlyInvalidTypeMessage(target),
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
        message: dateOnlyInvalidDateMessage(target),
      }
    );
