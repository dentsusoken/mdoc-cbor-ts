import { z } from 'zod';
import { createIntSchema } from '@/schemas/common/Int';
import { createNonEmptyTextSchema } from '@/schemas/common/NonEmptyText';
import { createRequiredSchema } from '@/schemas/common/Required';

/**
 * Creates an error message for invalid label types
 * @description
 * Generates a standardized error message when a label validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be an integer or non-empty string.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = labelInvalidTypeMessage('COSEKey');
 * // Returns: "COSEKey: Expected a number or a non-empty string, but received a different type. Please provide an integer or a non-empty string."
 * ```
 */
export const labelInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a number or a non-empty string, but received a different type. Please provide an integer or a non-empty string.`;

const createLabelInnerSchema = (target: string): z.ZodType<number | string> => {
  const intSchema = createIntSchema(target);
  const textSchema = createNonEmptyTextSchema(target);

  return z
    .any()
    .superRefine((val, ctx) => {
      const isNumber = typeof val === 'number';
      const isString = typeof val === 'string';

      const intResult = intSchema.safeParse(val);
      const textResult = textSchema.safeParse(val);

      if (!intResult.success && !textResult.success) {
        if (isNumber && intResult.error.issues.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intResult.error.issues[0].message,
          });
          return;
        }

        if (isString && textResult.error.issues.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: textResult.error.issues[0].message,
          });
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: labelInvalidTypeMessage(target),
        });
      }
    })
    .transform((v) => v) as unknown as z.ZodType<number | string>;
};

/**
 * Builds a schema for COSE label validation
 * @description
 * Returns a Zod schema that validates a required COSE label value, which can be either an integer or a non-empty string.
 * All validation error messages are prefixed with the provided `target` name and use the message constants exported
 * from this module.
 *
 * Validation rules:
 * - Requires presence with a target-prefixed required message
 * - Accepts either integer values (via `createIntSchema`) or non-empty strings (via `createNonEmptyTextSchema`)
 * - Uses target-prefixed invalid type message for type errors
 *
 * ```cddl
 * label = int / tstr
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "COSEKey", "DeviceKey")
 * @returns A Zod schema that validates integer or non-empty string values
 *
 * @example
 * ```typescript
 * const coseKeyLabelSchema = createLabelSchema('COSEKey');
 * const intLabel = coseKeyLabelSchema.parse(1); // number
 * const stringLabel = coseKeyLabelSchema.parse('kty'); // string
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "COSEKey: Expected a number or a non-empty string, but received a different type. Please provide an integer or a non-empty string."
 * const coseKeyLabelSchema = createLabelSchema('COSEKey');
 * // @ts-expect-error
 * coseKeyLabelSchema.parse(true);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: "COSEKey: This field is required"
 * const coseKeyLabelSchema = createLabelSchema('COSEKey');
 * // @ts-expect-error
 * coseKeyLabelSchema.parse(undefined);
 * ```
 */
export const createLabelSchema = (target: string): z.ZodType<number | string> =>
  createRequiredSchema(target).pipe(createLabelInnerSchema(target));

/**
 * Schema for COSE label validation
 * @description
 * Validates COSE labels which can be either integers or non-empty strings.
 * This is commonly used for COSE key parameters and other COSE structure labels.
 *
 * ```cddl
 * label = int / tstr
 * ```
 *
 * @example
 * ```typescript
 * const intLabel = labelSchema.parse(1); // number
 * const stringLabel = labelSchema.parse('kty'); // string
 * ```
 */
export const labelSchema = createLabelSchema('Label');

/**
 * Type definition for COSE labels
 * @description
 * Represents a validated COSE label which can be either an integer or a non-empty string.
 *
 * ```cddl
 * label = int / tstr
 * ```
 */
export type Label = z.output<typeof labelSchema>;
