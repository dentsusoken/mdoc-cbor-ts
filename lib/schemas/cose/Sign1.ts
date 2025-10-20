import { z } from 'zod';
import { headerMapSchema } from '@/schemas/cose/HeaderMap';
import { Tag } from 'cbor-x';
import { createTupleSchema } from '../containers/Tuple';
import { bytesSchema } from '../cbor/Bytes';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { createTag18 } from '@/cbor/createTag18';

/**
 * Zod schema for the COSE_Sign1 tuple structure.
 *
 * Structure: [protected, unprotected, payload, signature]
 *
 * - protected: Uint8Array (Headers encoded as a bstr)
 * - unprotected: HeaderMap (COSE headers not integrity-protected)
 * - payload: Uint8Array | null (the actual payload bytes or null)
 * - signature: Uint8Array (the signature computed over the structure)
 *
 * Used for validating the tuple shape of COSE_Sign1, not the tagged CBOR structure.
 */
export const sign1TupleSchema = createTupleSchema({
  target: 'Sign1',
  itemSchemas: [
    bytesSchema,
    headerMapSchema,
    bytesSchema.nullable(),
    bytesSchema,
  ],
});

/**
 * Type representing the validated 4-element tuple for COSE_Sign1.
 *
 * Tuple shape: [protected, unprotected, payload, signature]
 * - protected: Uint8Array (Headers encoded as a bstr)
 * - unprotected: HeaderMap (COSE headers not integrity-protected)
 * - payload: Uint8Array | null (the actual payload bytes or null)
 * - signature: Uint8Array (the signature computed over the structure)
 */
export type Sign1Tuple = z.output<typeof sign1TupleSchema>;

/**
 * Zod schema for validating a COSE_Sign1 structure.
 *
 * Accepts any of the following input types:
 * - A 4-element COSE_Sign1 tuple: `[protected, unprotected, payload, signature]`
 * - A CBOR `Tag(18, [...])` whose inner value matches the COSE_Sign1 tuple structure
 * - An object with a `getContentForEncoding()` method (such as an `@auth0/cose` Sign1 instance), whose method returns a valid tuple or array
 *
 * Parsing always returns a CBOR `Tag(18, tuple)` with validated contents.
 *
 * Details:
 * - The tuple structure is: `[protected: Uint8Array, unprotected: HeaderMap, payload: Uint8Array | null, signature: Uint8Array]`
 * - The parser enforces that payload is explicitly `Uint8Array` or `null` (never `undefined`)
 * - If a tagged value is passed, its tag must be 18
 * - If an object with `getContentForEncoding()` is passed, the result is recursively validated
 *
 * Input forms accepted:
 * - `[Uint8Array, HeaderMap, Uint8Array|null, Uint8Array]`
 * - Tag(18, [...])
 * - `{ getContentForEncoding(): [...] }`
 *
 * If the input does not conform to any supported form, a detailed error is issued.
 *
 * Example:
 * ```typescript
 * const schema = sign1Schema;
 * schema.parse([protected, unprotected, null, signature]);         // → Tag(18, [...])
 * schema.parse(createTag18([protected, unprotected, payload, signature])); // → Tag(18, [...])
 * schema.parse(sign1InstanceWithGetContentForEncoding);            // → Tag(18, [...])
 * ```
 */
export const sign1Schema = z.any().transform((value, ctx) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'getContentForEncoding' in value &&
    typeof value.getContentForEncoding === 'function'
  ) {
    const sign1Tuple = sign1TupleSchema.parse(value.getContentForEncoding());

    return createTag18(sign1Tuple);
  }

  if (Array.isArray(value)) {
    const sign1Tuple = sign1TupleSchema.parse(value);

    return createTag18(sign1Tuple);
  }

  if (value instanceof Tag) {
    if (value.tag !== 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target: 'Sign1',
          expected: 'Tag(18)',
          received: `Tag(${value.tag})`,
        }),
      });

      return z.never();
    }

    const sign1Tuple = sign1TupleSchema.parse(value.value);

    return createTag18(sign1Tuple);
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: containerInvalidTypeMessage({
      target: 'Sign1',
      expected:
        'Array[Uint8Array, HeaderMap, Uint8Array, Uint8Array] or Tag(18)',
      received: getTypeName(value),
    }),
  });

  return z.never();
});

/**
 * Type representing the validated output of a COSE_Sign1 structure.
 *
 * This type is produced by parsing input through the `sign1Schema`.
 */
export type Sign1 = z.output<typeof sign1Schema>;
