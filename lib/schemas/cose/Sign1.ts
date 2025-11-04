import { z } from 'zod';
import { headerMapSchema } from '@/schemas/cose/HeaderMap';
import { Tag } from 'cbor-x';
import { createTupleSchema } from '../containers/Tuple';
import { bytesSchema } from '../cbor/Bytes';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { createTag18 } from '@/cbor/createTag18';

/**
 * Creates a Zod schema for validating a COSE_Sign1 structure in any supported input format.
 *
 * ### Supported Input Forms:
 * - **Tuple (array)**: `[protected, unprotected, payload, signature]`
 *   - `protected` — `Uint8Array` (CBOR bstr-encoded headers)
 *   - `unprotected` — HeaderMap (typically a Zod-validated Map/Record)
 *   - `payload` — `Uint8Array` or `null` (the payload; must not be `undefined`)
 *   - `signature` — `Uint8Array`
 * - **Tagged CBOR object**: `Tag(tuple, 18)`
 *   - A CBOR Tag where the first argument is the tuple value and the second is the tag number (must be 18), as in `Tag(tuple, 18)`
 * - **Object with a `getContentForEncoding()` method**
 *   - For example, an `@auth0/cose` `Sign1` instance whose method returns a COSE_Sign1 tuple or array
 *
 * ### Output:
 * Always returns a `Tag(tuple, 18)` with a fully validated tuple for successful parsing.
 *
 * ### Behavior and Validation Notes:
 * - All tuple components are validated for type and shape; invalid inputs produce detailed Zod errors.
 * - If a `Tag` is provided, its tag **must be 18** (i.e., `Tag(value, 18)`); otherwise an error is produced.
 * - If the input is an object with `getContentForEncoding()`, its result is recursively validated.
 * - Any other type (including objects or arrays with the wrong shape) produces an error, using
 *   contextual type information in the error message.
 *
 * ### Example Usage:
 * ```ts
 * const schema = createSign1Schema('Sign1');
 * schema.parse([protected, unprotected, null, signature]);  // ⇒ Tag([...], 18)
 * schema.parse(createTag18([protected, unprotected, payload, signature])); // ⇒ Tag([...], 18)
 * schema.parse(sign1InstanceWithGetContentForEncoding);     // ⇒ Tag([...], 18)
 * ```
 *
 * @param target - Name of the logical container, used for error messaging
 * @returns A Zod schema that validates and normalizes a COSE_Sign1 structure as `Tag(18, tuple)`
 */
export const createSign1Schema = (
  target: string
): z.ZodEffects<z.ZodType<Tag, z.ZodTypeDef, unknown>> => {
  const sign1TupleSchema = createTupleSchema({
    target,
    itemSchemas: [
      bytesSchema,
      headerMapSchema,
      bytesSchema.nullable(),
      bytesSchema,
    ],
  });
  const tupleToSign1 = (tuple: unknown[], ctx: z.RefinementCtx): Tag => {
    const result = sign1TupleSchema.safeParse(tuple);

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue });
      }

      return z.NEVER;
    }

    return createTag18(result.data);
  };

  return z.any().transform((value, ctx) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      'getContentForEncoding' in value &&
      typeof value.getContentForEncoding === 'function'
    ) {
      return tupleToSign1(value.getContentForEncoding(), ctx);
    }

    if (Array.isArray(value)) {
      return tupleToSign1(value, ctx);
    }

    if (value instanceof Tag) {
      if (value.tag !== 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: containerInvalidTypeMessage({
            target,
            expected: 'Tag(18)',
            received: `Tag(${value.tag})`,
          }),
        });

        return z.NEVER;
      }

      const sign1Tuple = sign1TupleSchema.parse(value.value);

      return createTag18(sign1Tuple);
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: containerInvalidTypeMessage({
        target,
        expected:
          '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
        received: getTypeName(value),
      }),
    });

    return z.NEVER;
  });
};
