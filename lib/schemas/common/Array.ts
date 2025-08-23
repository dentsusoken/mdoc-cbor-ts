import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid array types
 * @description
 * Generates a standardized error message when an array validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be an array.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = arrayInvalidTypeMessage('Tags');
 * // Returns: "Tags: Expected an array, but received a different type. Please provide an array."
 * ```
 */
export const arrayInvalidTypeMessage = (target: string): string =>
  `${target}: Expected an array, but received a different type. Please provide an array.`;

/**
 * Creates an error message for empty array validation
 * @description
 * Generates a standardized error message when an array validation fails because
 * the array is empty but non-empty arrays are required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = arrayEmptyMessage('Tags');
 * // Returns: "Tags: At least one entry must be provided. The array cannot be empty."
 * ```
 */
export const arrayEmptyMessage = (target: string): string =>
  `${target}: At least one entry must be provided. The array cannot be empty.`;

type CreateArraySchemaParams<Output, Input = Output> = {
  target: string;
  itemSchema: z.ZodType<Output, z.ZodTypeDef, Input>;
  allowEmpty?: boolean;
};

const createArrayInnerSchema = <Output, Input = Output>({
  target,
  itemSchema,
  allowEmpty = false,
}: CreateArraySchemaParams<Output, Input>): z.ZodType<
  Output[],
  z.ZodTypeDef,
  Input[]
> =>
  z
    .array(itemSchema, {
      invalid_type_error: arrayInvalidTypeMessage(target),
    })
    .refine(
      (data) => {
        return allowEmpty || data.length > 0;
      },
      {
        message: arrayEmptyMessage(target),
      }
    );

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
export const createArraySchema = <Output, Input = Output>({
  target,
  itemSchema,
  allowEmpty = false,
}: CreateArraySchemaParams<Output, Input>): z.ZodType<
  Output[],
  z.ZodTypeDef,
  Input[]
> =>
  createRequiredSchema(target).pipe(
    createArrayInnerSchema({ target, itemSchema, allowEmpty })
  );
