import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid tuple type validation
 * @description
 * Generates a standardized error message when a tuple validation fails because
 * the input is not an array type.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = fixedTupleLengthInvalidTypeMessage('DeviceMac');
 * // Returns: "DeviceMac: Expected an array, but received a different type. Please provide an array."
 * ```
 */
export const fixedTupleLengthInvalidTypeMessage = (target: string): string =>
  `${target}: Expected an array, but received a different type. Please provide an array.`;

/**
 * Creates an error message for tuple arrays with too few elements
 * @description
 * Generates a standardized error message when a tuple validation fails because
 * the array has fewer than the required number of elements.
 *
 * @param target - The name of the target schema being validated
 * @param length - The required number of elements
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = fixedTupleLengthTooFewMessage('DeviceMac', 4);
 * // Returns: "DeviceMac: Tuple must contain at least 4 element(s)"
 * ```
 */
export const fixedTupleLengthTooFewMessage = (
  target: string,
  length: number
): string => `${target}: Tuple must contain at least ${length} element(s)`;

/**
 * Creates an error message for tuple arrays with too many elements
 * @description
 * Generates a standardized error message when a tuple validation fails because
 * the array has more than the required number of elements.
 *
 * @param target - The name of the target schema being validated
 * @param length - The required number of elements
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = fixedTupleLengthTooManyMessage('DeviceMac', 4);
 * // Returns: "DeviceMac: Tuple must contain at most 4 element(s)"
 * ```
 */
export const fixedTupleLengthTooManyMessage = (
  target: string,
  length: number
): string => `${target}: Tuple must contain at most ${length} element(s)`;

/**
 * Creates an inner schema for validating fixed tuple length
 * @description
 * Internal helper function that creates a Zod schema for validating arrays
 * have exactly the specified number of elements. This schema validates the
 * array type and enforces exact length constraints.
 *
 * @param target - The name of the target schema (used in error messages)
 * @param length - The required number of elements in the tuple
 * @returns A Zod schema that validates array type and exact length
 *
 * @internal
 */
const createFixedTupleLengthInnerSchema = (
  target: string,
  length: number
): z.ZodEffects<z.ZodArray<z.ZodAny>, unknown[], unknown[]> => {
  return z
    .array(z.any(), {
      invalid_type_error: fixedTupleLengthInvalidTypeMessage(target),
    })
    .superRefine((val, ctx) => {
      if (val.length < length) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          type: 'array',
          minimum: length,
          inclusive: true,
          exact: true,
          message: fixedTupleLengthTooFewMessage(target, length),
        });
      } else if (val.length > length) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          type: 'array',
          maximum: length,
          inclusive: true,
          exact: true,
          message: fixedTupleLengthTooManyMessage(target, length),
        });
      }
    });
};

/**
 * Creates a schema for validating fixed tuple length
 * @description
 * Generates a Zod schema that validates arrays have exactly the specified number of elements.
 * This is a generic utility for enforcing tuple length constraints. The schema first validates
 * that the input is not null or undefined, then validates it's an array with the exact length.
 *
 * Validation rules:
 * - Must not be null or undefined
 * - Must be an array with exactly the specified number of elements
 * - Each element can be any type (validated by subsequent schemas)
 *
 * @param target - The name of the target schema (used in error messages)
 * @param length - The required number of elements in the tuple
 * @returns A Zod schema that validates tuple length
 *
 * @example
 * ```typescript
 * const mac0LengthSchema = createFixedTupleLengthSchema('DeviceMac', 4);
 * const mac0Array = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = mac0LengthSchema.parse(mac0Array); // Returns unknown[] with length 4
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (too few elements)
 * const schema = createFixedTupleLengthSchema('Tuple', 3);
 * schema.parse([1, 2]); // Error: "Tuple: Tuple must contain at least 3 element(s)"
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (too many elements)
 * const schema = createFixedTupleLengthSchema('Tuple', 2);
 * schema.parse([1, 2, 3]); // Error: "Tuple: Tuple must contain at most 2 element(s)"
 * ```
 */
export const createFixedTupleLengthSchema = (
  target: string,
  length: number
): z.ZodType<unknown[], z.ZodTypeDef, unknown> =>
  createRequiredSchema(target).pipe(
    createFixedTupleLengthInnerSchema(target, length)
  );
