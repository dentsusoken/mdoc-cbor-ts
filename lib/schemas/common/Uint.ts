import { z } from 'zod';

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
 * Creates an error message for required uint fields
 * @description
 * Generates a standardized error message when a required uint field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = uintRequiredMessage('DigestID');
 * // Returns: "DigestID: This field is required. Please provide a positive integer."
 * ```
 */
export const uintRequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide a positive integer.`;

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
 * Creates an error message for uint positive validation
 * @description
 * Generates a standardized error message when a uint validation fails because
 * the value is not positive (must be greater than 0).
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = uintPositiveMessage('DigestID');
 * // Returns: "DigestID: Please provide a positive integer greater than 0"
 * ```
 */
export const uintPositiveMessage = (target: string): string =>
  `${target}: Please provide a positive integer greater than 0`;

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
      invalid_type_error: uintInvalidTypeMessage(target),
      required_error: uintRequiredMessage(target),
    })
    .int({
      message: uintIntegerMessage(target),
    })
    .positive({
      message: uintPositiveMessage(target),
    });
