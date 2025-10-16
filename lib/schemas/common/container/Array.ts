import { z } from 'zod';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidValueMessage } from './common-messages/containerInvalidValueMessage';

/**
 * Creates an error message when a non-array value is provided where an array is expected.
 *
 * @description
 * Returns a standardized error message indicating the expected type (array) and the actual type received,
 * for use in schema validation error reporting.
 *
 * @param target - The name of the schema, container, or field being validated (e.g., "Tags", "Addresses").
 * @param value - The value that failed validation by not being an array.
 * @returns A formatted error message string indicating the type mismatch,
 * e.g., "Tags: Expected an array, but received String".
 *
 * @example
 * const message = arrayInvalidTypeMessage("Tags", {});
 * // Returns: "Tags: Expected an array, but received Object"
 */
export const arrayInvalidTypeMessage = (
  target: string,
  value: unknown
): string => `${target}: Expected an array, but received ${getTypeName(value)}`;

/**
 * Creates an error message when an array is empty but a non-empty array is required.
 *
 * @description
 * Generates a standardized error message for use in schema validation when an empty array
 * is encountered but the schema requires at least one entry.
 *
 * @param target - The name of the schema, container, or field being validated (e.g., "Tags", "Addresses").
 * @returns A formatted error message string indicating that the array cannot be empty.
 *
 * @example
 * const message = arrayEmptyMessage("Tags");
 * // Returns: "Tags: At least one entry must be provided. The array cannot be empty."
 */
export const arrayEmptyMessage = (target: string): string =>
  `${target}: At least one entry must be provided. The array cannot be empty.`;

type CreateArraySchemaParams<Output, Input = Output> = {
  target: string;
  itemSchema: z.ZodType<Output, z.ZodTypeDef, Input>;
  allowEmpty?: boolean;
};

/**
 * Creates a Zod schema for validating and transforming arrays of items,
 * with optional control over allowing empty arrays and detailed error messages.
 *
 * This utility validates that the input is an array, checks for optional empty allowance,
 * and applies the provided `itemSchema` to each element, collecting errors per index.
 * Error messages are prefixed with the container/target name for more helpful diagnostics.
 *
 * @template Output - Output type of the item schema (e.g., string, User type, etc.)
 * @template Input - Input type accepted by the item schema (defaults to Output)
 * @param params.target - The name of the schema, container, or field for use in validation error messages.
 * @param params.itemSchema - A Zod schema for validating each item in the array.
 * @param params.allowEmpty - Whether to allow empty arrays; defaults to false (empty not allowed).
 * @returns A Zod schema that parses and validates arrays of the given item type, with improved user-facing error messages.
 *
 * @example
 * const schema = createArraySchema({
 *   target: "Tags",
 *   itemSchema: z.string().min(1)
 * });
 * schema.parse(['a', 'b']); // OK
 * schema.parse([]); // Throws with message "Tags: At least one entry must be provided. The array cannot be empty."
 * schema.parse([123]); // Throws with item-level message
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
  z.any().transform((data, ctx) => {
    if (!Array.isArray(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: arrayInvalidTypeMessage(target, data),
      });
      return z.NEVER;
    }

    if (!allowEmpty && data.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: arrayEmptyMessage(target),
      });
      return z.NEVER;
    }

    const output = [] as Output[];
    let hasError = false;

    data.forEach((item, index) => {
      const result = itemSchema.safeParse(item);
      if (!result.success) {
        hasError = true;
        for (const issue of result.error.issues) {
          const path = [index, ...issue.path];
          ctx.addIssue({
            ...issue,
            path,
            message: containerInvalidValueMessage(target, path, issue.message),
          });
        }
      } else {
        output.push(result.data);
      }
    });

    if (hasError) {
      return z.NEVER;
    }

    return output;
  });
