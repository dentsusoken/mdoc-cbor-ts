import { z } from 'zod';
import { DateTime } from '@/cbor/DateTime';

/**
 * Creates an error message for invalid DateTime types
 * @description
 * Generates a standardized error message when a DateTime validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a DateTime instance.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = dateTimeInvalidTypeMessage('ValidityInfo');
 * // Returns: "ValidityInfo: Expected a DateTime instance, but received a different type."
 * ```
 */
export const dateTimeInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a DateTime instance, but received a different type.`;

/**
 * Creates an error message for invalid DateTime instances
 * @description
 * Generates a standardized error message when a DateTime validation fails because
 * the DateTime instance contains an invalid date.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = dateTimeInvalidDateMessage('ValidityInfo');
 * // Returns: "ValidityInfo: The DateTime instance contains an invalid date."
 * ```
 */
export const dateTimeInvalidDateMessage = (target: string): string =>
  `${target}: The DateTime instance contains an invalid date.`;

/**
 * Builds a date-time schema that validates DateTime instances.
 * @description
 * The resulting schema:
 * - Requires a DateTime instance with a target-prefixed invalid type message
 * - Validates that the DateTime is valid by checking if toISOString() throws an error
 *
 * This schema is designed for validating DateTime instances that come from CBOR decoding,
 * where Tag(0) is automatically converted to DateTime instances by the CBOR-x extension.
 * Invalid DateTime instances (created from malformed date strings in CBOR) will throw
 * RangeError when toISOString() is called, which this schema catches and reports as
 * a validation error.
 *
 * ```cddl
 * DateTime = tdate
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "ValidityInfo", "IssuerAuth")
 *
 * @example
 * ```typescript
 * const validityInfoSchema = createDateTimeSchema('ValidityInfo');
 * const dateTime = new DateTime('2024-03-20T15:30:00Z');
 * const value = validityInfoSchema.parse(dateTime); // DateTime instance
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "ValidityInfo: Expected a DateTime instance, but received a different type."
 * const validityInfoSchema = createDateTimeSchema('ValidityInfo');
 * validityInfoSchema.parse('2024-03-20T15:30:00Z'); // String instead of DateTime
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid date)
 * // Message: "ValidityInfo: The DateTime instance contains an invalid date."
 * const validityInfoSchema = createDateTimeSchema('ValidityInfo');
 * // This would be created from CBOR decoding of invalid date string
 * const invalidDateTime = decodeCbor(invalidCborData) as DateTime;
 * validityInfoSchema.parse(invalidDateTime);
 * ```
 */
export const createDateTimeSchema = (target: string): z.ZodType<DateTime> =>
  z
    .instanceof(DateTime, {
      message: dateTimeInvalidTypeMessage(target),
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
        message: dateTimeInvalidDateMessage(target),
      }
    );
