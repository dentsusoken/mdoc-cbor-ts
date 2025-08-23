import { z } from 'zod';

/**
 * Creates an error message for required fields
 * @description
 * Generates a standardized error message when a required field is missing.
 * The message indicates the expected target name and that null or undefined values are not allowed.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = requiredMessage('Signature');
 * // Returns: "Signature: This field is required. null or undefined values are not allowed."
 * ```
 */
export const requiredMessage = (target: string): string =>
  `${target}: This field is required. null or undefined values are not allowed.`;

/**
 * Creates a schema for validating required fields
 * @description
 * Generates a Zod schema that validates any value is not null or undefined.
 * This schema can be used as a base validation for required fields before
 * applying more specific type validations.
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates the value is not null or undefined
 *
 * @example
 * ```typescript
 * const requiredSchema = createRequiredSchema('Username');
 * const result = requiredSchema.parse('john'); // Returns 'john'
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (null value)
 * const requiredSchema = createRequiredSchema('Username');
 * requiredSchema.parse(null);
 * ```
 */
export const createRequiredSchema = (target: string): z.ZodTypeAny =>
  z.any().refine((v) => v !== null && v !== undefined, {
    message: requiredMessage(target),
  });
