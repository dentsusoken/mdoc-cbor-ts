import { z } from 'zod';

/**
 * Creates an error message for invalid non-empty text types
 * @description
 * Generates a standardized error message when a non-empty text validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a string identifier.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = nonEmptyTextInvalidTypeMessage('DocType');
 * // Returns: "DocType: Expected a string, but received a different type. Please provide a string identifier."
 * ```
 */
export const nonEmptyTextInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a string, but received a different type. Please provide a string identifier.`;

/**
 * Creates an error message for required non-empty text fields
 * @description
 * Generates a standardized error message when a required non-empty text field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = nonEmptyTextRequiredMessage('DocType');
 * // Returns: "DocType: This field is required. Please provide a string identifier."
 * ```
 */
export const nonEmptyTextRequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide a string identifier.`;

/**
 * Creates an error message for empty text validation
 * @description
 * Generates a standardized error message when a non-empty text validation fails because
 * the string is empty or contains only whitespace.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = nonEmptyTextEmptyMessage('DocType');
 * // Returns: "DocType: Please provide a non-empty string identifier"
 * ```
 */
export const nonEmptyTextEmptyMessage = (target: string): string =>
  `${target}: Please provide a non-empty string identifier`;

/**
 * Builds a string schema with consistent error messages and non-empty checks.
 * @description
 * The resulting schema:
 * - Requires a string type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces non-empty (including trim) with a target-prefixed message
 *
 * ```cddl
 * Text = text
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DocType", "NameSpace")
 */
export const createNonEmptyTextSchema = (target: string): z.ZodType<string> =>
  z
    .string({
      invalid_type_error: nonEmptyTextInvalidTypeMessage(target),
      required_error: nonEmptyTextRequiredMessage(target),
    })
    .refine((val) => val.trim().length > 0, {
      message: nonEmptyTextEmptyMessage(target),
    });
