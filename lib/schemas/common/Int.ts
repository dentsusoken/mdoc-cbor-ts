import { z } from 'zod';

export const INT_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected a number, but received a different type. Please provide an integer.';
export const INT_REQUIRED_MESSAGE_SUFFIX =
  'This field is required. Please provide an integer.';
export const INT_INTEGER_MESSAGE_SUFFIX =
  'Please provide an integer (no decimal places)';

/**
 * Builds a number schema for integers (int).
 * @description
 * Returns a Zod schema that validates a required integer (`int`) value. All
 * validation error messages are prefixed with the provided `target` name and
 * use the message suffix constants exported from this module.
 *
 * Validation rules:
 * - Requires a number type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces integer (no decimals) with a target-prefixed message
 *
 * ```cddl
 * Int = int
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "ErrorCode")
 *
 * @example
 * ```typescript
 * const errorCodeSchema = createIntSchema('ErrorCode');
 * const value = errorCodeSchema.parse(-42); // number (integers allowed: negative, zero, positive)
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not an integer)
 * // Message: "ErrorCode: Please provide an integer (no decimal places)"
 * const errorCodeSchema = createIntSchema('ErrorCode');
 * errorCodeSchema.parse(1.5);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: `ErrorCode: ${INT_INVALID_TYPE_MESSAGE_SUFFIX}`
 * const errorCodeSchema = createIntSchema('ErrorCode');
 * // @ts-expect-error
 * errorCodeSchema.parse('123');
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: `ErrorCode: ${INT_REQUIRED_MESSAGE_SUFFIX}`
 * const errorCodeSchema = createIntSchema('ErrorCode');
 * // @ts-expect-error
 * errorCodeSchema.parse(undefined);
 * ```
 */
export const createIntSchema = (target: string): z.ZodType<number> =>
  z
    .number({
      invalid_type_error: `${target}: ${INT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${INT_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .int({
      message: `${target}: ${INT_INTEGER_MESSAGE_SUFFIX}`,
    });
