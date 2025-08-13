import { z } from 'zod';

export const TEXT_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected a string, but received a different type. Please provide a string identifier.';
export const TEXT_REQUIRED_MESSAGE_SUFFIX =
  'This field is required. Please provide a string identifier.';
export const TEXT_EMPTY_MESSAGE_SUFFIX =
  'Please provide a non-empty string identifier';

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
export const createTextSchema = (target: string): z.ZodType<string> =>
  z
    .string({
      invalid_type_error: `${target}: ${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${TEXT_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .refine((val) => val.trim().length > 0, {
      message: `${target}: ${TEXT_EMPTY_MESSAGE_SUFFIX}`,
    });
