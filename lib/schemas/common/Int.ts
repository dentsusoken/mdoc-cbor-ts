import { z } from 'zod';

/**
 * Creates an error message for invalid int types
 * @description
 * Generates a standardized error message when an int validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be an integer.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = intInvalidTypeMessage('ErrorCode');
 * // Returns: "ErrorCode: Expected a number, but received a different type. Please provide an integer."
 * ```
 */
export const intInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a number, but received a different type. Please provide an integer.`;

/**
 * Creates an error message for required int fields
 * @description
 * Generates a standardized error message when a required int field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = intRequiredMessage('ErrorCode');
 * // Returns: "ErrorCode: This field is required. Please provide an integer."
 * ```
 */
export const intRequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide an integer.`;

/**
 * Creates an error message for int integer validation
 * @description
 * Generates a standardized error message when an int validation fails because
 * the value contains decimal places but integers are required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = intIntegerMessage('ErrorCode');
 * // Returns: "ErrorCode: Please provide an integer (no decimal places)"
 * ```
 */
export const intIntegerMessage = (target: string): string =>
  `${target}: Please provide an integer (no decimal places)`;

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
      invalid_type_error: intInvalidTypeMessage(target),
      required_error: intRequiredMessage(target),
    })
    .int({
      message: intIntegerMessage(target),
    });
