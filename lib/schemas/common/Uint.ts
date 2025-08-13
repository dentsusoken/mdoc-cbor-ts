import { z } from 'zod';

export const UINT_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected a number, but received a different type. Please provide a positive integer.';
export const UINT_REQUIRED_MESSAGE_SUFFIX =
  'This field is required. Please provide a positive integer.';
export const UINT_INTEGER_MESSAGE_SUFFIX =
  'Please provide an integer (no decimal places)';
export const UINT_POSITIVE_MESSAGE_SUFFIX =
  'Please provide a positive integer greater than 0';

/**
 * Builds a number schema for unsigned integers (uint).
 * @description
 * Returns a Zod schema that validates a required positive integer (uint) value.
 * All validation error messages are prefixed with the provided `target` name
 * and use the message suffix constants exported from this module.
 *
 * Validation rules:
 * - Requires a number type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces integer (no decimals) with a target-prefixed message
 * - Enforces strictly positive (> 0) with a target-prefixed message
 *
 * ```cddl
 * Uint = uint
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DigestID")
 * @example
 * ```typescript
 * const digestIDSchema = createUintSchema('DigestID');
 *
 * const digestID = digestIDSchema.parse(123); // number
 *
 * // Throws ZodError with message:
 * // "DigestID: Please provide an integer (no decimal places)"
 * digestIDSchema.parse(1.5);
 * ```
 */
export const createUintSchema = (target: string): z.ZodType<number> =>
  z
    .number({
      invalid_type_error: `${target}: ${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${UINT_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .int({
      message: `${target}: ${UINT_INTEGER_MESSAGE_SUFFIX}`,
    })
    .positive({
      message: `${target}: ${UINT_POSITIVE_MESSAGE_SUFFIX}`,
    });
