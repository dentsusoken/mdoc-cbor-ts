import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { signatureSchema } from './Signature';
import { createFixedTupleLengthSchema } from '../common/FixedTupleLength';
import { Tag } from 'cbor-x';
import { createTag18 } from '@/cbor/createTag18';

export const sign1InvalidTupleMessage = (target: string): string =>
  `${target}: structure must be [Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array]`;

export const sign1InvalidTypeMessage = (target: string): string =>
  `${target}: type must be [Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array] or Tag18([Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array])`;

export const sign1FailedToVerifyMessage = (
  target: string,
  error: string
): string => `${target}: failed to verify: ${error}`;

/**
 * Tuple schema for COSE_Sign1 structure validation
 * @description
 * Validates the 4-element array structure of COSE_Sign1 and wraps it in a CBOR Tag 18.
 * The payload is accepted as `Uint8Array | null` (detached payloads use `null`).
 * `undefined` is not allowed. The returned value is a CBOR Tag 18 containing
 * the validated 4-tuple.
 *
 * Elements:
 * - 0: Protected headers (`Uint8Array`)
 * - 1: Unprotected headers (`Map<number, unknown>`)
 * - 2: Payload (`Uint8Array | null`) – `null` if input was `null`
 * - 3: Signature (`Uint8Array`)
 *
 * Note: This schema only accepts raw tuples; see `createSign1Schema` if you
 * want to accept either a raw tuple or a pre-wrapped `Tag(18, [...])`.
 */
const createSign1TupleSchema = (
  target: string
): z.ZodType<
  Tag,
  z.ZodTypeDef,
  [Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array]
> =>
  z
    .tuple(
      [
        protectedHeadersSchema, // protected headers (Bytes)
        unprotectedHeadersSchema, // unprotected headers (LabelKeyMap)
        // Normalize undefined/null to null so output type excludes undefined
        payloadSchema, // payload (Bytes | null)
        signatureSchema, // signature (Bytes)
      ],
      {
        message: sign1InvalidTupleMessage(target),
      }
    )
    .transform((value) => {
      return createTag18(value);
    });

/**
 * Schema for validating COSE_Sign1 tuples or Tag(18) wrappers
 * @description
 * Accepts either:
 * - a raw 4-element COSE_Sign1 tuple
 * - or a CBOR `Tag(18, [...])` whose inner value conforms to the same tuple
 *
 * In both cases, the payload must be `Uint8Array | null` (never `undefined`).
 * The parsed output is always a CBOR Tag 18 wrapping the validated tuple.
 *
 * ```cddl
 * COSE_Sign1 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * uint => any
 *   },
 *   payload:     bstr / null,
 *   signature:   bstr
 * ]
 * ```
 *
 * Validation rules:
 * - If input is a tuple: must have exactly 4 elements and match expected types
 * - If input is a Tag: `tag` must be 18 and `value` must pass the same tuple validation
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns Zod schema that parses to a CBOR Tag 18 containing the COSE_Sign1 structure
 *
 * @example
 * ```typescript
 * const schema = createSign1Schema('DeviceSignature');
 * // Tuple input
 * const t = [protectedHeaders, unprotectedHeaders, null, signature] as const;
 * const tagA = schema.parse(t); // Tag(18, [...])
 *
 * // Tag input
 * const tagB = schema.parse(createTag18(t)); // Passes as well
 * ```
 */
export const createSign1Schema = (
  target: string
): z.ZodType<Tag, z.ZodTypeDef, unknown> =>
  z.union(
    [
      createFixedTupleLengthSchema(target, 4).pipe(
        createSign1TupleSchema(target)
      ),
      z
        .instanceof(Tag)
        .refine(
          (tag) =>
            tag.tag === 18 &&
            createFixedTupleLengthSchema(target, 4)
              .pipe(createSign1TupleSchema(target))
              .safeParse(tag.value).success
        ),
    ],
    {
      errorMap: () => ({
        message: sign1InvalidTypeMessage(target),
      }),
    }
  );
