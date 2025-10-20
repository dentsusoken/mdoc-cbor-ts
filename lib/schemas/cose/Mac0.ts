import { z } from 'zod';
import { headerMapSchema } from '@/schemas/cose/HeaderMap';
import { Tag } from 'cbor-x';
import { createTag17 } from '@/cbor/createTag17';
import { createTupleSchema } from '../containers/Tuple';
import { bytesSchema } from '../cbor/Bytes';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';

/**
 * Zod schema for the COSE_Mac0 tuple structure.
 *
 * Structure: [protected, unprotected, payload, tag]
 *
 * - protected: Uint8Array (Headers encoded as a bstr)
 * - unprotected: HeaderMap (COSE headers not integrity-protected)
 * - payload: Uint8Array | null (the actual payload bytes or null)
 * - tag: Uint8Array (the MAC computed over the structure)
 *
 * Used for validating the tuple shape, not the tagged CBOR structure.
 */
export const mac0TupleSchema = createTupleSchema({
  target: 'Mac0',
  itemSchemas: [
    bytesSchema,
    headerMapSchema,
    bytesSchema.nullable(),
    bytesSchema,
  ],
});

/**
 * Type representing the validated 4-element tuple for COSE_Mac0.
 *
 * Tuple shape: [protected, unprotected, payload, tag]
 * - protected: Uint8Array (Headers encoded as a bstr)
 * - unprotected: HeaderMap (COSE headers not integrity-protected)
 * - payload: Uint8Array | null (the actual payload bytes or null)
 * - tag: Uint8Array (the MAC computed over the structure)
 */
export type Mac0Tuple = z.output<typeof mac0TupleSchema>;

/**
 * Zod schema for validating a COSE_Mac0 structure.
 *
 * Accepts any of the following input types:
 * - A 4-element COSE_Mac0 tuple: `[protected, unprotected, payload, tag]`
 * - A CBOR `Tag(17, [...])` whose inner value matches the COSE_Mac0 tuple structure
 * - An object with a `getContentForEncoding()` method (such as an `@auth0/cose` Mac0 instance), whose method returns a valid tuple or array
 *
 * Parsing always returns a CBOR `Tag(17, tuple)` with validated contents.
 *
 * Details:
 * - The tuple structure is: `[protected: Uint8Array, unprotected: HeaderMap, payload: Uint8Array | null, tag: Uint8Array]`
 * - The parser enforces that payload is explicitly `Uint8Array` or `null` (never `undefined`)
 * - If a tagged value is passed, its tag must be 17
 * - If an object with `getContentForEncoding()` is passed, the result is recursively validated
 *
 * Input forms accepted:
 * - `[Uint8Array, HeaderMap, Uint8Array|null, Uint8Array]`
 * - Tag(17, [...])
 * - `{ getContentForEncoding(): [...] }`
 *
 * If the input does not conform to any supported form, a detailed error is issued.
 *
 * Example:
 * ```typescript
 * const schema = mac0Schema;
 * schema.parse([protectedHeaders, unprotectedHeaders, null, tag]);         // → Tag(17, [...])
 * schema.parse(createTag17([protectedHeaders, unprotectedHeaders, payload, tag])); // → Tag(17, [...])
 * schema.parse(mac0InstanceWithGetContentForEncoding);                    // → Tag(17, [...])
 * ```
 */
export const mac0Schema = z.any().transform((value, ctx) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'getContentForEncoding' in value &&
    typeof value.getContentForEncoding === 'function'
  ) {
    const mac0Tuple = mac0TupleSchema.parse(value.getContentForEncoding());

    return createTag17(mac0Tuple);
  }

  if (Array.isArray(value)) {
    const mac0Tuple = mac0TupleSchema.parse(value);

    return createTag17(mac0Tuple);
  }

  if (value instanceof Tag) {
    if (value.tag !== 17) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target: 'Mac0',
          expected: 'Tag(17)',
          received: `Tag(${value.tag})`,
        }),
      });

      return z.never();
    }

    const mac0Tuple = mac0TupleSchema.parse(value.value);

    return createTag17(mac0Tuple);
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: containerInvalidTypeMessage({
      target: 'Mac0',
      expected:
        'Array[Uint8Array, HeaderMap, Uint8Array, Uint8Array] or Tag(17)',
      received: getTypeName(value),
    }),
  });

  return z.never();
});

/**
 * Type representing the validated output of a COSE_Mac0 structure.
 *
 * This type is produced by parsing input through the `mac0Schema`.
 */
export type Mac0 = z.output<typeof mac0Schema>;
