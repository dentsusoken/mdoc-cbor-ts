import { z } from 'zod';
import { protectedHeadersSchema } from '@/schemas/cose/ProtectedHeaders';
import { unprotectedHeadersSchema } from '@/schemas/cose/UnprotectedHeaders';
import { payloadSchema } from '@/schemas/cose/Payload';
import { tagSchema } from '@/schemas/cose/Tag';
import { createFixedTupleLengthSchema } from '../common/FixedTupleLength';
import { Tag } from 'cbor-x';
import { createTag17 } from '@/cbor/createTag17';

/**
 * Returns an error message indicating that the structure of the COSE_Mac0 tuple is invalid.
 *
 * @param target - The name of the target or context for the error message
 * @returns The formatted error message describing the expected tuple structure
 */
export const mac0InvalidTupleMessage = (target: string): string =>
  `${target}: structure must be [Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array]`;

/**
 * Returns an error message indicating that the type provided is not a valid COSE_Mac0 tuple or Tag17 wrapper.
 *
 * @param target - The name of the target or context for the error message
 * @returns The formatted error message describing the expected types
 */
export const mac0InvalidTypeMessage = (target: string): string =>
  `${target}: type must be [Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array] or Tag17([Uint8Array, Map<number, unknown>, Uint8Array | null, Uint8Array])`;

/**
 * Returns an error message indicating that verification of the COSE_Mac0 structure failed.
 *
 * @param target - The name of the target or context for the error message
 * @param error - The error message or reason for the verification failure
 * @returns The formatted error message including the failure reason
 */
export const mac0FailedToVerifyMessage = (
  target: string,
  error: string
): string => `${target}: failed to verify: ${error}`;

/**
 * Type definition for a COSE_Mac0 tuple.
 *
 * @description
 * Represents the 4-element tuple structure of a COSE_Mac0 object:
 * - 0: Protected headers (Uint8Array)
 * - 1: Unprotected headers (Map<number, unknown>)
 * - 2: Payload (Uint8Array or null)
 * - 3: Tag (Uint8Array)
 */
export type Mac0Tuple = [
  Uint8Array,
  Map<number, unknown>,
  Uint8Array | null,
  Uint8Array,
];

/**
 * Tuple schema for COSE_Mac0 structure validation
 * @description
 * Validates the 4-element array structure of COSE_Mac0 and wraps it in a CBOR Tag 17.
 * The payload is accepted as `Uint8Array | null` (detached payloads use `null`).
 * `undefined` is not allowed. The returned value is a CBOR Tag 17 containing
 * the validated 4-tuple.
 *
 * Elements:
 * - 0: Protected headers (`Uint8Array`)
 * - 1: Unprotected headers (`Map<number, unknown>`)
 * - 2: Payload (`Uint8Array | null`) – `null` if input was `null`
 * - 3: Tag (`Uint8Array`)
 *
 * Note: This schema only accepts raw tuples; see `createMac0Schema` if you
 * want to accept either a raw tuple or a pre-wrapped `Tag(17, [...])`.
 */
const createMac0TupleSchema = (
  target: string
): z.ZodType<Tag, z.ZodTypeDef, Mac0Tuple> =>
  z
    .tuple(
      [
        protectedHeadersSchema, // protected headers (Bytes)
        unprotectedHeadersSchema, // unprotected headers (LabelKeyMap)
        // Normalize undefined/null to null so output type excludes undefined
        payloadSchema, // payload (Bytes | null)
        tagSchema, // tag (Bytes)
      ],
      {
        message: mac0InvalidTupleMessage(target),
      }
    )
    .transform((value) => {
      return createTag17(value);
    });

/**
 * Schema for validating COSE_Mac0 tuples or Tag(17) wrappers
 * @description
 * Accepts either:
 * - a raw 4-element COSE_Mac0 tuple
 * - or a CBOR `Tag(17, [...])` whose inner value conforms to the same tuple
 *
 * In both cases, the payload must be `Uint8Array | null` (never `undefined`).
 * The parsed output is always a CBOR Tag 17 wrapping the validated tuple.
 *
 * ```cddl
 * COSE_Mac0 = [
 *   protected:   bstr,
 *   unprotected: {
 *     * uint => any
 *   },
 *   payload:     bstr / null,
 *   tag:         bstr
 * ]
 * ```
 *
 * Validation rules:
 * - If input is a tuple: must have exactly 4 elements and match expected types
 * - If input is a Tag: `tag` must be 17 and `value` must pass the same tuple validation
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns Zod schema that parses to a CBOR Tag 17 containing the COSE_Mac0 structure
 *
 * @example
 * ```typescript
 * const schema = createMac0Schema('DeviceMac');
 * // Tuple input
 * const t = [protectedHeaders, unprotectedHeaders, null, tag] as const;
 * const tagA = schema.parse(t); // Tag(17, [...])
 *
 * // Tag input
 * const tagB = schema.parse(createTag17(t)); // Passes as well
 * ```
 */
export const createMac0Schema = (
  target: string
): z.ZodType<Tag, z.ZodTypeDef, unknown> =>
  z.union(
    [
      createFixedTupleLengthSchema(target, 4).pipe(
        createMac0TupleSchema(target)
      ),
      z
        .instanceof(Tag)
        .refine(
          (tag) =>
            tag.tag === 17 &&
            createFixedTupleLengthSchema(target, 4)
              .pipe(createMac0TupleSchema(target))
              .safeParse(tag.value).success
        ),
    ],
    {
      errorMap: () => ({
        message: mac0InvalidTypeMessage(target),
      }),
    }
  );
