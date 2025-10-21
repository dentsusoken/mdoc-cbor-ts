import { getTypeName } from '@/utils/getTypeName';
import { z } from 'zod';
import { valueInvalidTypeMessage } from '../messages/valueInvalidTypeMessage';

const stringSchema = z.string().min(1);

const intSchema = z.number().int();

/**
 * Zod schema for validating a COSE label (used as Map keys).
 *
 * @description
 * Accepts either a non-empty string or an integer number as a valid label.
 * Produces clear error messages if the value is neither type.
 *
 * Validation rules:
 * - Accepts string (must be non-empty)
 * - Accepts number (must be integer)
 * - Any other type is rejected with a context-specific error message
 *
 * @example
 * ```typescript
 * labelSchema.parse('foo'); // returns 'foo'
 * labelSchema.parse(1);     // returns 1
 * labelSchema.parse('');    // throws ZodError (empty string)
 * labelSchema.parse(1.5);   // throws ZodError (not integer)
 * labelSchema.parse(null);  // throws ZodError (not string/number)
 * ```
 *
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common COSE key labels}
 */
export const labelSchema = z.any().transform((data, ctx) => {
  if (typeof data === 'string') {
    const result = stringSchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    result.error.issues.forEach((issue) => {
      ctx.addIssue({ ...issue });
    });
    return z.NEVER;
  }

  if (typeof data === 'number') {
    const result = intSchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    result.error.issues.forEach((issue) => {
      ctx.addIssue({ ...issue });
    });
    return z.NEVER;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: valueInvalidTypeMessage({
      expected: 'string or number',
      received: getTypeName(data),
    }),
  });

  return z.NEVER;
}) as unknown as z.ZodEffects<
  z.ZodType<number | string, z.ZodTypeDef, unknown>
>;

/**
 * Type representing a valid COSE label.
 *
 * @description
 * A COSE label accepted by {@link labelSchema}—either a non-empty string or an integer number.
 * Used as keys in COSE structures such as key maps.
 *
 * @see labelSchema
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common COSE key labels}
 */
export type Label = z.output<typeof labelSchema>;
