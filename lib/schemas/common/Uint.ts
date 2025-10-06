import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid uint types
 * @description
 * Generates a standardized error message when a uint validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a positive integer.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = uintInvalidTypeMessage('DigestID');
 * // Returns: "DigestID: Expected a number, but received a different type. Please provide a positive integer."
 * ```
 */
export const uintInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a number, but received a different type. Please provide a positive integer.`;

/**
 * Creates an error message for uint integer validation
 * @description
 * Generates a standardized error message when a uint validation fails because
 * the value contains decimal places but integers are required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = uintIntegerMessage('DigestID');
 * // Returns: "DigestID: Please provide an integer (no decimal places)"
 * ```
 */
export const uintIntegerMessage = (target: string): string =>
  `${target}: Please provide an integer (no decimal places)`;

/**
 * Creates an error message for uint non-negative validation
 * @description
 * Generates a standardized error message when a uint validation fails because
 * the value is negative (must be greater than or equal to 0).
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = uintNonNegativeMessage('DigestID');
 * // Returns: "DigestID: Please provide a non-negative integer (>= 0)"
 * ```
 */
export const uintNonNegativeMessage = (target: string): string =>
  `${target}: Please provide a non-negative integer (>= 0)`;

const createUintInnerSchema = (target: string): z.ZodType<number> =>
  z
    .number({
      invalid_type_error: uintInvalidTypeMessage(target),
    })
    .int({
      message: uintIntegerMessage(target),
    })
    .nonnegative({
      message: uintNonNegativeMessage(target),
    });

/**
 * Builds a number schema for unsigned integers (uint)
 * @description
 * Returns a Zod schema that validates a required non-negative integer (uint) value.
 * All validation error messages are prefixed with the provided `target` name
 * and use the message constants exported from this module.
 *
 * Validation rules:
 * - Requires a number type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces integer (no decimals) with a target-prefixed message
 * - Enforces non-negative (>= 0) with a target-prefixed message
 *
 * ```cddl
 * Uint = uint
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DigestID")
 * @returns A Zod schema that validates non-negative integer values
 *
 * @example
 * ```typescript
 * const digestIDSchema = createUintSchema('DigestID');
 * const digestID = digestIDSchema.parse(0); // number - 0 is valid
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (decimal places)
 * // Message: "DigestID: Please provide an integer (no decimal places)"
 * const digestIDSchema = createUintSchema('DigestID');
 * digestIDSchema.parse(1.5);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (negative)
 * // Message: "DigestID: Please provide a non-negative integer (>= 0)"
 * const digestIDSchema = createUintSchema('DigestID');
 * digestIDSchema.parse(-1);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "DigestID: Expected a number, but received a different type. Please provide a positive integer."
 * const digestIDSchema = createUintSchema('DigestID');
 * // @ts-expect-error
 * digestIDSchema.parse('123');
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: "DigestID: This field is required"
 * const digestIDSchema = createUintSchema('DigestID');
 * // @ts-expect-error
 * digestIDSchema.parse(undefined);
 * ```
 */
export const createUintSchema = (target: string): z.ZodType<number> =>
  createRequiredSchema(target).pipe(createUintInnerSchema(target));
