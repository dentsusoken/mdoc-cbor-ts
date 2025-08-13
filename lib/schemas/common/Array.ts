import { z } from 'zod';

// Error messages
export const ARRAY_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected an array, but received a different type. Please provide an array.';
export const ARRAY_REQUIRED_MESSAGE_SUFFIX =
  'This field is required. Please provide an array.';
export const ARRAY_EMPTY_MESSAGE_SUFFIX =
  'At least one entry must be provided. The array cannot be empty.';

type CreateArraySchemaParams<T> = {
  target: string;
  itemSchema: z.ZodType<T>;
  allowEmpty?: boolean;
};

/**
 * Builds an array schema with optional non-empty enforcement.
 * @description
 * Returns a Zod schema that validates a required array of items, where each
 * item is validated by the provided `itemSchema`. By default, the array must be
 * non-empty; set `allowEmpty: true` to allow empty arrays. All validation error
 * messages are prefixed with the provided `target` and use the suffix constants
 * exported from this module.
 *
 * Validation rules:
 * - Requires an array type
 * - Enforces non-empty by default; pass `allowEmpty: true` to allow empty array
 * - Each item must satisfy the provided `itemSchema`
 *
 * @param target - Prefix used in error messages (e.g., "Tags")
 * @param itemSchema - Zod schema describing each item in the array
 * @param allowEmpty - When true, allows an empty array (default: false)
 *
 * @example
 * ```typescript
 * const tagsSchema = createArraySchema({ target: 'Tags', itemSchema: z.string() });
 * const result = tagsSchema.parse(['a', 'b']); // string[]
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty array is not allowed)
 * const tagsSchema = createArraySchema({ target: 'Tags', itemSchema: z.string() });
 * tagsSchema.parse([]);
 * ```
 *
 * @example
 * ```typescript
 * // Allows empty array with allowEmpty
 * const tagsSchema = createArraySchema({ target: 'Tags', itemSchema: z.string(), allowEmpty: true });
 * const result = tagsSchema.parse([]); // []
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * const tagsSchema = createArraySchema({ target: 'Tags', itemSchema: z.string() });
 * // @ts-expect-error
 * tagsSchema.parse('not-array');
 * ```
 */
export const createArraySchema = <T>({
  target,
  itemSchema,
  allowEmpty = false,
}: CreateArraySchemaParams<T>): z.ZodType<T[]> =>
  z
    .array(itemSchema, {
      invalid_type_error: `${target}: ${ARRAY_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${ARRAY_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .refine(
      (data) => {
        return allowEmpty || data.length > 0;
      },
      {
        message: `${target}: ${ARRAY_EMPTY_MESSAGE_SUFFIX}`,
      }
    );
