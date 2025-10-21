import { z } from 'zod';
import { headerMapSchema } from '@/schemas/cose/HeaderMap';
import { Tag } from 'cbor-x';
import { createTupleSchema } from '../containers/Tuple';
import { bytesSchema } from '../cbor/Bytes';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { createTag17 } from '@/cbor/createTag17';

/**
 * Creates a Zod schema for validating a COSE_Mac0 structure in any supported input format.
 *
 * ### Supported Input Forms:
 * - **Tuple (array)**: `[protected, unprotected, payload, tag]`
 *   - `protected` — `Uint8Array` (CBOR bstr-encoded headers)
 *   - `unprotected` — HeaderMap (typically a Zod-validated Map/Record)
 *   - `payload` — `Uint8Array` or `null` (the payload; must not be `undefined`)
 *   - `tag` — `Uint8Array`
 * - **Tagged CBOR object**: `Tag(tuple, 17)`
 *   - A CBOR Tag where the first argument is the tuple value and the second is the tag number (must be 17), as in `Tag(tuple, 17)`
 * - **Object with a `getContentForEncoding()` method**
 *   - For example, an `@auth0/cose` `Mac0` instance whose method returns a COSE_Mac0 tuple or array
 *
 * ### Output:
 * Always returns a `Tag(tuple, 17)` with a fully validated tuple for successful parsing.
 *
 * ### Behavior and Validation Notes:
 * - All tuple components are validated for type and shape; invalid inputs produce detailed Zod errors.
 * - If a `Tag` is provided, its tag **must be 17** (i.e., `Tag(value, 17)`); otherwise an error is produced.
 * - If the input is an object with `getContentForEncoding()`, its result is recursively validated.
 * - Any other type (including objects or arrays with the wrong shape) produces an error, using
 *   contextual type information in the error message.
 *
 * ### Example Usage:
 * ```ts
 * const schema = createMac0Schema('Mac0');
 * schema.parse([protected, unprotected, null, tag]);  // ⇒ Tag([protected, unprotected, null, tag], 17)
 * schema.parse(new Tag([protected, unprotected, payload, tag], 17)); // ⇒ Tag([protected, unprotected, payload, tag], 17)
 * schema.parse(mac0InstanceWithGetContentForEncoding);     // ⇒ Tag([protected, unprotected, payload, tag], 17)
 * ```
 *
 * @param target - Name of the logical container, used for error messaging
 * @returns A Zod schema that validates and normalizes a COSE_Mac0 structure as `Tag(tuple, 17)`
 */
export const createMac0Schema = (
  target: string
): z.ZodEffects<z.ZodType<Tag, z.ZodTypeDef, unknown>> => {
  const tupleSchema = createTupleSchema({
    target,
    itemSchemas: [
      bytesSchema,
      headerMapSchema,
      bytesSchema.nullable(),
      bytesSchema,
    ],
  });
  const tupleToMac0 = (tuple: unknown[], ctx: z.RefinementCtx): Tag => {
    const result = tupleSchema.safeParse(tuple);

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue });
      }

      return z.NEVER;
    }

    return createTag17(result.data);
  };

  return z.any().transform((value, ctx) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      'getContentForEncoding' in value &&
      typeof value.getContentForEncoding === 'function'
    ) {
      return tupleToMac0(value.getContentForEncoding(), ctx);
    }

    if (Array.isArray(value)) {
      return tupleToMac0(value, ctx);
    }

    if (value instanceof Tag) {
      if (value.tag !== 17) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: containerInvalidTypeMessage({
            target,
            expected: 'Tag(17)',
            received: `Tag(${value.tag})`,
          }),
        });

        return z.NEVER;
      }

      const tuple = tupleSchema.parse(value.value);

      return createTag17(tuple);
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: containerInvalidTypeMessage({
        target,
        expected:
          '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
        received: getTypeName(value),
      }),
    });

    return z.NEVER;
  });
};
