import { z } from 'zod';
import { createRequiredSchema } from './Required';

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

const createNonEmptyTextInnerSchema = (target: string): z.ZodType<string> =>
  z
    .string({
      invalid_type_error: nonEmptyTextInvalidTypeMessage(target),
    })
    .refine((val) => val.trim().length > 0, {
      message: nonEmptyTextEmptyMessage(target),
    });

/**
 * Builds a string schema with consistent error messages and non-empty checks.
 * @description
 * Returns a Zod schema that validates a required non-empty string value. All
 * validation error messages are prefixed with the provided `target` name and
 * use the message constants exported from this module.
 *
 * Validation rules:
 * - Requires a string type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces non-empty (including trim) with a target-prefixed message
 *
 * ```cddl
 * Text = text
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DocType", "NameSpace")
 *
 * @example
 * ```typescript
 * const docTypeSchema = createNonEmptyTextSchema('DocType');
 * const value = docTypeSchema.parse('org.iso.18013.5.1.mDL'); // string
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty string)
 * // Message: "DocType: Please provide a non-empty string identifier"
 * const docTypeSchema = createNonEmptyTextSchema('DocType');
 * docTypeSchema.parse('');
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (whitespace only)
 * // Message: "DocType: Please provide a non-empty string identifier"
 * const docTypeSchema = createNonEmptyTextSchema('DocType');
 * docTypeSchema.parse('   ');
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "DocType: Expected a string, but received a different type. Please provide a string identifier."
 * const docTypeSchema = createNonEmptyTextSchema('DocType');
 * // @ts-expect-error
 * docTypeSchema.parse(123);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: "DocType: This field is required"
 * const docTypeSchema = createNonEmptyTextSchema('DocType');
 * // @ts-expect-error
 * docTypeSchema.parse(undefined);
 * ```
 */
export const createNonEmptyTextSchema = (target: string): z.ZodType<string> =>
  createRequiredSchema(target).pipe(createNonEmptyTextInnerSchema(target));
